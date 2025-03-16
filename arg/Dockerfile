FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

ARG OTEL_DENO=true

# Run the app
CMD ["deno", "run", \
    "--allow-read", \
    "--allow-env", \
    "--allow-sys", \
    "--allow-net", \
    "--allow-run", \
    "--unstable-otel", \
    "main.ts"]