from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_host: str = Field(alias='DB_HOST')
    db_user: str = Field(alias='DB_USER')
    db_password: str = Field(alias='DB_PASSWORD')
    db_name: str = Field(alias='DB_NAME')
    secret_key: str = Field(alias='JWT_SECRET')

    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    test_database_url: str = "sqlite:///./test.db"

    @property
    def database_url(self) -> str:
        return f"mysql+mysqlconnector://{self.db_user}:{self.db_password}@{self.db_host}/{self.db_name}"

    class Config:
        env_file = '.env'
        extra = 'ignore'

settings = Settings()
