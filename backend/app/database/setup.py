import asyncio
import logging
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, AsyncSessionLocal
from app.database.seed import seed_data

# Import all models to ensure they are registered on the Base metadata
from app.models.base import (
    ClimateSnapshot,
    ClimateSummary,
    DisasterAlert,
    AlertEvent,
    RiskPrediction,
    MonsoonStatus
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("db-setup")

async def init_db():
    async with engine.begin() as conn:
        logger.info("Dropping existing tables (if any)...")
        await conn.run_sync(Base.metadata.drop_all)
        
        logger.info("Creating tables from SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)

async def main():
    logger.info("Starting database setup...")
    try:
        await init_db()
        
        async with AsyncSessionLocal() as session:
            await seed_data(session)
            
        logger.info("Database setup finished successfully!")
    except Exception as e:
        logger.exception("Failed to initialize database:")
        raise

if __name__ == "__main__":
    asyncio.run(main())
