-- CREATE TABLE "daily_usage" (
CREATE TABLE "daily_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"ip_address" varchar,
	"date" varchar NOT NULL,
	"translation_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"star_rating" integer NOT NULL,
	"feedback_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"original_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"original_language" varchar(10) NOT NULL,
	"target_language" varchar(10) NOT NULL,
	"original_audio_url" text,
	"translated_audio_url" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"country" varchar NOT NULL,
	"current_country_of_resident" varchar NOT NULL,
	"how_they_heard" varchar NOT NULL,
	"organization" varchar,
	"what_they_do" varchar NOT NULL,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daily_usage" ADD CONSTRAINT "daily_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "usage_user_id_idx" ON "daily_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_session_id_idx" ON "daily_usage" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "usage_ip_address_idx" ON "daily_usage" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "translations_user_id_idx" ON "translations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "translations_session_id_idx" ON "translations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");
