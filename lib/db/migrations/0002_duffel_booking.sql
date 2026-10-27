ALTER TABLE "bookings" ADD COLUMN "offer_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "provider_order_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "data_mode" text;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_user_provider_offer_uidx" ON "bookings" ("user_id","provider","offer_id") WHERE "offer_id" IS NOT NULL;
