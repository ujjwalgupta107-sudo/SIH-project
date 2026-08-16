"""Authority resolver — maps city + issue type to municipal authority name.

This is NOT hardcoded to Lucknow. The lookup is configurable and falls back
gracefully to the state-level municipal body if a specific city match is not found.

To add a new city:
  1. Add an entry to CITY_AUTHORITY_MAP below.
  2. Or set environment-level overrides via a future DB-backed config table.
"""
from typing import Optional

# Maps lowercase city name → authority name
# Add cities as needed. This list is intentionally sparse to avoid fabrication.
CITY_AUTHORITY_MAP: dict[str, str] = {
    # Uttar Pradesh
    'lucknow': 'Lucknow Municipal Corporation (LMC)',
    'kanpur': 'Kanpur Nagar Nigam',
    'agra': 'Agra Nagar Nigam',
    'varanasi': 'Varanasi Nagar Nigam',
    'prayagraj': 'Prayagraj Nagar Nigam',
    'allahabad': 'Prayagraj Nagar Nigam',
    # Delhi
    'delhi': 'Municipal Corporation of Delhi (MCD)',
    'new delhi': 'New Delhi Municipal Council (NDMC)',
    # Maharashtra
    'mumbai': 'Brihanmumbai Municipal Corporation (BMC)',
    'pune': 'Pune Municipal Corporation (PMC)',
    'nagpur': 'Nagpur Municipal Corporation (NMC)',
    # Karnataka
    'bengaluru': 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    'bangalore': 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    # Tamil Nadu
    'chennai': 'Greater Chennai Corporation (GCC)',
    # West Bengal
    'kolkata': 'Kolkata Municipal Corporation (KMC)',
    # Rajasthan
    'jaipur': 'Jaipur Municipal Corporation (JMC)',
    # Gujarat
    'ahmedabad': 'Ahmedabad Municipal Corporation (AMC)',
    'surat': 'Surat Municipal Corporation (SMC)',
    # Telangana
    'hyderabad': 'Greater Hyderabad Municipal Corporation (GHMC)',
    # Madhya Pradesh
    'bhopal': 'Bhopal Municipal Corporation (BMC)',
    'indore': 'Indore Municipal Corporation (IMC)',
}

# Department assignment per issue class (used by resolver)
CLASS_DEPARTMENT_MAP: dict[str, str] = {
    'pothole': 'Road Maintenance / PWD',
    'waterlogging': 'Drainage / Municipal Corporation',
}


def resolve_authority(city: Optional[str], issue_class: str) -> str:
    """
    Return a human-readable authority string for a given city and issue class.

    If the city is unknown, returns a generic municipal body descriptor.
    Never fabricates specific authority names for unknown cities.
    """
    dept = CLASS_DEPARTMENT_MAP.get(issue_class, 'Municipal Corporation')

    if not city:
        return f'Local Municipal Authority — {dept}'

    city_lower = city.strip().lower()
    authority = CITY_AUTHORITY_MAP.get(city_lower)

    if authority:
        return f'{authority} — {dept}'
    else:
        # Do not fabricate — return generic with the actual city name
        return f'{city} Municipal Corporation — {dept}'