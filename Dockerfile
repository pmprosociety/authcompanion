FROM hayd/alpine-deno:1.7.2

EXPOSE 3000

WORKDIR /app

# Prefer not to run as root.

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in app.ts.
COPY deps.ts .
RUN deno --unstable cache deps.ts

RUN wget https://github.com/golang-migrate/migrate/releases/download/v4.14.1/migrate.linux-amd64.tar.gz; tar xvfz migrate.linux-amd64.tar.gz

# These steps will be re-run upon each file change in your working directory:
ADD . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno --unstable cache bin/server.ts

USER deno

# Start AuthC API Server
CMD [ "run", "-A", "--unstable", "bin/server.ts" ]
