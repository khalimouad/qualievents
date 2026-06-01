CREATE TABLE "host_requests" (
    "id"           TEXT NOT NULL,
    "firstName"    TEXT NOT NULL,
    "lastName"     TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "phone"        TEXT,
    "organization" TEXT NOT NULL,
    "eventType"    TEXT,
    "message"      TEXT,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "host_requests_pkey" PRIMARY KEY ("id")
);
