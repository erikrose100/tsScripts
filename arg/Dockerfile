FROM denoland/deno:2.2.5 as build

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

FROM denoland/deno:2.2.5

COPY --from=build /app /app

WORKDIR /app

ENV AZ_SUBSCRIPTION_LIST="913575a3-f8f6-4972-91e3-4d69586885ef,4237c3b9-3b4b-4566-8757-79bdf72fdb84"

# Run the app
CMD ["deno", "run", \
    "--allow-read", \
    "--allow-env", \
    "--allow-sys", \
    "--allow-net", \
    "--allow-run", \
    "main.ts"]
