from slowapi import Limiter
from slowapi.util import get_remote_address

# headers_enabled makes slowapi attach Retry-After and X-RateLimit-* to 429
# responses. Without it those headers are never set, so the client can only say
# "try again later" instead of naming the actual wait.
limiter = Limiter(key_func=get_remote_address, headers_enabled=True)
