import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from dotenv import load_dotenv

load_dotenv()

from backend.database import db, init_db
from backend.routes.generate import router as generate_router
from backend.routes.pages import router as pages_router
from backend.routes.telegram import router as telegram_router
from backend.services.seo import ROBOTS_TXT, build_sitemap

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    try:
        from backend.services.cursor_service import recover_pending_jobs
        await recover_pending_jobs()
    except Exception as e:
        logger.warning(f"Cursor recovery skipped: {e}")
    logger.info("RusskiyAsphalt backend started")
    yield
    logger.info("Shutdown")


app = FastAPI(
    title="РусскийАсфальт API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://russkiyasphalt.ru"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)
app.include_router(pages_router)
app.include_router(telegram_router)


@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots():
    return ROBOTS_TXT


@app.get("/sitemap.xml")
async def sitemap():
    doc = await db.settings.find_one({"key": "sitemap"})
    if doc and doc.get("xml"):
        return Response(content=doc["xml"], media_type="application/xml")
    # Fallback: build on the fly
    pages = await db.generated_pages.find(
        {}, {"url": 1, "type": 1, "generated_at": 1, "_id": 0}
    ).to_list(10000)
    xml = build_sitemap(pages)
    return Response(content=xml, media_type="application/xml")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/__spa", response_class=HTMLResponse, include_in_schema=False)
async def spa_shell(path: str = Query("/", description="Original request path")):
    """Serve SPA shell with unique meta tags (nginx @spa fallback)."""
    from backend.services.spa_meta import render_spa_html

    try:
        html, is_known = await render_spa_html(path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    return HTMLResponse(
        html,
        status_code=404 if not is_known else 200,
        headers={"Cache-Control": "public, max-age=300"},
    )
