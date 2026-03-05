from bs4 import BeautifulSoup
import os
import sys

# # Resolve the path relative to the project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

def clean_value(value: str):
    value = value.strip()
    
    # Empty
    if value in ("-", "", "N/D", "N/A"):
        return None
    
    # Height and weight: "179 cm" -> 179.0
    if value.endswith(" cm") or value.endswith(" kg"):
        return float(value.split()[0])
    
    # Salary: "193,000 € p/m" -> 193000.0
    if "€" in value and "p/m" in value:
        return float(value.replace(".", "").replace(",", ".").split("€")[0].strip())
    
    # Percentage: "64%" -> 64.0
    if value.endswith("%"):
        try:
            return float(value[:-1])
        except ValueError:
            return None
    
    # games in the bench: "32 (1)" -> 32
    if "(" in value:
        return int(value.split("(")[0].strip())
    
    # numbers with virgulas: "2,728" -> 2728
    try:
        return float(value.replace(",", ""))
    except ValueError:
        return value
    
def parse_html(filepath: str):

    if not os.path.isabs(filepath):
        filepath = os.path.join(DATA_DIR, filepath)
    # Extract the season from the name of the file
    season = os.path.splitext(os.path.basename(filepath))[0]
    
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        soup = BeautifulSoup(f, "html.parser")
    
    rows = soup.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all("th")]
    
    print(f"Season: {season}")
    print(f"Headers found: {len(headers)}")
    print(f"Rows found: {len(rows) - 1}")
    
    return headers, rows, season

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m app.parser <ficheiro.html>")
        print("Example: python -m app.parser ../../data/2030-2031.html")
        sys.exit(1)
    
    parse_html(sys.argv[1])