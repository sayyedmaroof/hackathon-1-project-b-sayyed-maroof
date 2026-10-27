CREATE TABLE "saved_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trip_id" text NOT NULL,
	"travel_date" text NOT NULL,
	"ready_by_days" integer NOT NULL,
	"net_saving_eur" numeric(12, 2) NOT NULL,
	"cash_source" text NOT NULL,
	"fetched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_plans" ADD CONSTRAINT "saved_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "saved_plans_user_id_idx" ON "saved_plans" USING btree ("user_id");
