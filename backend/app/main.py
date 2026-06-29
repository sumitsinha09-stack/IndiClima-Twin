import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

# Setup logger
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("api-server")

app = FastAPI(
    title="IndiClima Twin India API",
    description="AI-Powered Digital Twin of India's Climate",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Replicate CORS middleware from Express app.use(cors())
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom logging middleware resembling Node's pino-http
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info(
        f"method={request.method} url={request.url.path} status={response.status_code} duration={duration * 1000:.2f}ms"
    )
    return response

# Prefix all routes with /api just like Node app.use("/api", router)
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # Read host and port from configuration settings
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.NODE_ENV == "development"
    )
