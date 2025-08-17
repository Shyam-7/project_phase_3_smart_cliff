from ..models.user import UserInDB
from typing import Optional
from mysql.connector.connection import MySQLConnection

# This is a dummy function. In a real application, you would query the database.
# For simplicity, we'll return a hardcoded user.
def get_user(db: MySQLConnection, username: str) -> Optional[UserInDB]:
    # In a real app, you would do:
    # cursor = db.cursor(dictionary=True)
    # cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    # user = cursor.fetchone()
    # cursor.close()
    # if user:
    #     return UserInDB(**user)
    # return None

    # Dummy data for demonstration
    if username == "admin":
        return UserInDB(id=1, username="admin", role="admin", hashed_password="$2b$12$EixZaYVK1e.JSgu6aC0b2u5i/j4jN5a4aFFpG.Wlza2aG1sC.O7a.") # password is "adminpassword"
    if username == "user":
        return UserInDB(id=2, username="user", role="user", hashed_password="$2b$12$EixZaYVK1e.JSgu6aC0b2u5i/j4jN5a4aFFpG.Wlza2aG1sC.O7a.") # password is "userpassword"
    return None
