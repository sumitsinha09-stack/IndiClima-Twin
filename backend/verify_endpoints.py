import urllib.request
import urllib.parse
import json
import sys

base_url = "http://localhost:8080/api"

endpoints = [
    ("/healthz", "GET", None),
    ("/climate/current", "GET", None),
    ("/climate/map-layers", "GET", None),
    ("/climate/trends", "GET", None),
    ("/climate/summary", "GET", None),
    ("/alerts", "GET", None),
    ("/alerts/detailed", "GET", None),
    ("/alerts/recent", "GET", None),
    ("/predictions/risks", "GET", None),
    ("/predictions/forecast", "GET", None),
    ("/predictions/monsoon", "GET", None),
    ("/scenarios/simulate", "POST", {
        "temperatureChange": 1.5,
        "rainfallChange": -10.0,
        "deforestationPercent": 5.0,
        "urbanExpansionPercent": 8.0,
        "seaLevelRise": 0.2,
        "carbonEmissionsChange": 15.0,
        "urbanGreenCoverPercent": 10.0,
        "albedoIndex": 0.3
    }),
    ("/agriculture/dashboard", "GET", None),
    ("/water/dashboard", "GET", None),
    ("/agriculture/chat", "POST", {"message": "How is the paddy crop doing?"}),
    ("/energy/dashboard", "GET", None),
    ("/reports/download", "GET", None),
]

failed = False

print("Testing FastAPI backend endpoints...")
for path, method, payload in endpoints:
    url = f"{base_url}{path}"
    print(f"Testing {method} {url} ... ", end="")
    try:
        req = urllib.request.Request(url, method=method)
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            req.add_header("Content-Type", "application/json")
            req.data = data
        
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            content_type = response.info().get_content_type()
            
            if status == 200:
                print("SUCCESS")
                # Skip json check for PDF binary content
                if content_type == "application/pdf" or path == "/reports/download":
                    response.read() # just read it
                else:
                    body = response.read().decode("utf-8")
                    json.loads(body)
            else:
                print(f"FAILED (Status: {status})")
                failed = True
    except Exception as e:
        print(f"ERROR: {e}")
        failed = True

if failed:
    print("\nSome tests FAILED.")
    sys.exit(1)
else:
    print("\nAll endpoints tested successfully!")
    sys.exit(0)
