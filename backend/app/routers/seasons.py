from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()

@router.get("/seasons")
def get_seasons():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, imported_at FROM seasons ORDER BY name")
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [{"id": row[0], "name": row[1], "imported_at": row[2]} for row in rows]