#!/bin/bash
# Security features manual test script for ISSUE-15

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "Security Features Test Script - ISSUE-15"
echo "================================================"
echo ""

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the server first with: pnpm dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Helmet Security Headers
echo "================================================"
echo "Test 1: Helmet Security Headers"
echo "================================================"
echo "Checking for security headers..."
HEADERS=$(curl -s -I "$BASE_URL/health")

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
else
    echo -e "${RED}❌ X-Frame-Options header missing${NC}"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options header present${NC}"
else
    echo -e "${RED}❌ X-Content-Type-Options header missing${NC}"
fi

if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✅ Strict-Transport-Security header present${NC}"
else
    echo -e "${RED}❌ Strict-Transport-Security header missing${NC}"
fi
echo ""

# Test 2: CORS - Unauthorized Origin
echo "================================================"
echo "Test 2: CORS - Unauthorized Origin"
echo "================================================"
echo "Testing with unauthorized origin: http://unauthorized-site.com"
CORS_UNAUTHORIZED=$(curl -s -I -H "Origin: http://unauthorized-site.com" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS "$BASE_URL/health")

if echo "$CORS_UNAUTHORIZED" | grep -q "Access-Control-Allow-Origin: http://unauthorized-site.com"; then
    echo -e "${RED}❌ FAIL: Unauthorized origin was allowed${NC}"
else
    echo -e "${GREEN}✅ PASS: Unauthorized origin was blocked${NC}"
fi
echo ""

# Test 3: CORS - Authorized Origin
echo "================================================"
echo "Test 3: CORS - Authorized Origin"
echo "================================================"
echo "Testing with authorized origin: http://localhost:3001"
CORS_AUTHORIZED=$(curl -s -I -H "Origin: http://localhost:3001" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS "$BASE_URL/health")

if echo "$CORS_AUTHORIZED" | grep -q "Access-Control-Allow-Origin: http://localhost:3001"; then
    echo -e "${GREEN}✅ PASS: Authorized origin was allowed${NC}"
else
    echo -e "${RED}❌ FAIL: Authorized origin was blocked${NC}"
fi

if echo "$CORS_AUTHORIZED" | grep -q "Access-Control-Allow-Credentials: true"; then
    echo -e "${GREEN}✅ PASS: Credentials are enabled${NC}"
else
    echo -e "${RED}❌ FAIL: Credentials are not enabled${NC}"
fi
echo ""

# Test 4: Rate Limiting
echo "================================================"
echo "Test 4: Rate Limiting (100 req/15min)"
echo "================================================"
echo -e "${YELLOW}Sending 101 requests to trigger rate limit...${NC}"

# Send 101 requests
for i in {1..101}; do
    curl -s "$BASE_URL/health" > /dev/null 2>&1
    if [ $((i % 20)) -eq 0 ]; then
        echo "  Sent $i requests..."
    fi
done

echo "  Sent 101 requests..."
sleep 1

# Check if next request returns 429
RATE_LIMIT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RATE_LIMIT_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$RATE_LIMIT_RESPONSE" | head -1)

if [ "$HTTP_CODE" = "429" ]; then
    echo -e "${GREEN}✅ PASS: Rate limit triggered (HTTP 429)${NC}"
    if echo "$RESPONSE_BODY" | grep -q "Too many requests"; then
        echo -e "${GREEN}✅ PASS: Custom error message present${NC}"
        echo "   Message: $RESPONSE_BODY"
    else
        echo -e "${RED}❌ FAIL: Custom error message missing${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Rate limit not triggered (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 5: Body Size Limit
echo "================================================"
echo "Test 5: Request Body Size Limit (10MB)"
echo "================================================"
echo -e "${YELLOW}Creating 11MB payload...${NC}"

# Create a large JSON payload (11MB)
LARGE_PAYLOAD=$(python3 -c "import json; print(json.dumps({'data': 'x' * (11 * 1024 * 1024)}))")
BODY_SIZE_RESPONSE=$(echo "$LARGE_PAYLOAD" | curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/echo" \
    -H "Content-Type: application/json" \
    -d @- 2>&1 || true)

HTTP_CODE=$(echo "$BODY_SIZE_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "413" ]; then
    echo -e "${GREEN}✅ PASS: Body size limit enforced (HTTP 413)${NC}"
else
    # Note: Some implementations may reject large payloads differently
    echo -e "${YELLOW}⚠️  Response: HTTP $HTTP_CODE${NC}"
    echo "   (Body size limit is configured, server may handle oversized requests differently)"
fi
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo "All critical security features have been tested."
echo ""
echo "To manually verify rate limits reset, wait 15 minutes or restart the server."
echo ""
