CREATE TABLE "user_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"balance" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_balances_user_currency" UNIQUE("user_id","currency")
);
--> statement-breakpoint
CREATE TABLE "user_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" text NOT NULL,
	"revolut_plan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_cards_user_card" UNIQUE("user_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "user_spend_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"monthly_total_eur" integer DEFAULT 0 NOT NULL,
	"groceries_eur" integer DEFAULT 0 NOT NULL,
	"travel_eur" integer DEFAULT 0 NOT NULL,
	"dining_eur" integer DEFAULT 0 NOT NULL,
	"fuel_eur" integer DEFAULT 0 NOT NULL,
	"other_eur" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spend_profile" ADD CONSTRAINT "user_spend_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_balances_user_id_idx" ON "user_balances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_cards_user_id_idx" ON "user_cards" USING btree ("user_id");