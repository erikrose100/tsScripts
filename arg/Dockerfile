FROM denoland/deno:2.2.5 as build

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

FROM denoland/deno:2.2.5

COPY --from=build /app .

# ENV AZ_SUBSCRIPTION_LIST="GUID,GUID"

# Run the app
CMD ["deno", "run", \
    "--allow-read", \
    "--allow-env", \
    "--allow-sys", \
    "--allow-net", \
    "--allow-run", \
    "main.ts"]
