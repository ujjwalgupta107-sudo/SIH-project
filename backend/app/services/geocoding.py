"""Reverse geocoding via OpenStreetMap Nominatim (free, no API key required).

Rate limit: 1 request/second per Nominatim policy.
Cache is in-process only (no Redis dependency).
"""
import time
import httpx
from typing import Optional

# Simple in-memory cache: (lat_r, lng_r) -> result dict
_cache: dict[tuple, dict] = {}
_last_request_time: float = 0.0
_RATE_LIMIT_SECONDS = 1.1  # slightly above 1 req/sec

NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
HEADERS = {'User-Agent': 'CivicShield-AI/0.2 (civic-infrastructure-monitoring)'}


def reverse_geocode(lat: float, lng: float, timeout: float = 5.0) -> dict:
    """
    Reverse geocode a lat/lng to an address component dict.
    Returns dict with keys like: city, town, suburb, state, country, postcode.
    Returns {} on failure (caller handles gracefully).
    """
    global _last_request_time

    # Round to 3 decimals (~100m resolution) for cache key
    key = (round(lat, 3), round(lng, 3))
    if key in _cache:
        return _cache[key]

    # Respect Nominatim rate limit
    elapsed = time.time() - _last_request_time
    if elapsed < _RATE_LIMIT_SECONDS:
        time.sleep(_RATE_LIMIT_SECONDS - elapsed)

    try:
        _last_request_time = time.time()
        resp = httpx.get(
            NOMINATIM_URL,
            params={
                'lat': lat,
                'lon': lng,
                'format': 'json',
                'addressdetails': 1,
                'accept-language': 'en',
            },
            headers=HEADERS,
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        address = data.get('address', {})
        _cache[key] = address
        return address
    except Exception as exc:
        print(f'[geocoding] Nominatim error for ({lat}, {lng}): {exc}')
        return {}
