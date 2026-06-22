CREATE TABLE "competitions" (
	"competition_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"competition_name" varchar(255) NOT NULL,
	"season_name" varchar(255) NOT NULL,
	CONSTRAINT "competitions_competition_id_season_id_pk" PRIMARY KEY("competition_id","season_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"match_id" integer PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_season_stats" (
	"player_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"appearances" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"xg" numeric(8, 4) DEFAULT '0' NOT NULL,
	"xa" numeric(8, 4) DEFAULT '0' NOT NULL,
	"shots" integer DEFAULT 0 NOT NULL,
	"shots_on_target" integer DEFAULT 0 NOT NULL,
	"key_passes" integer DEFAULT 0 NOT NULL,
	"passes_attempted" integer DEFAULT 0 NOT NULL,
	"passes_completed" integer DEFAULT 0 NOT NULL,
	"pass_completion_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"progressive_passes" integer DEFAULT 0 NOT NULL,
	"carries" integer DEFAULT 0 NOT NULL,
	"progressive_carries" integer DEFAULT 0 NOT NULL,
	"successful_dribbles" integer DEFAULT 0 NOT NULL,
	"tackles" integer DEFAULT 0 NOT NULL,
	"interceptions" integer DEFAULT 0 NOT NULL,
	"ball_recoveries" integer DEFAULT 0 NOT NULL,
	"pressures" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "player_season_stats_player_id_competition_id_season_id_pk" PRIMARY KEY("player_id","competition_id","season_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"player_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"team_id" integer NOT NULL,
	"position" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "raw_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"team_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_season_id_competitions_competition_id_season_id_fk" FOREIGN KEY ("competition_id","season_id") REFERENCES "public"."competitions"("competition_id","season_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_team_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_team_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_competition_id_season_id_competitions_competition_id_season_id_fk" FOREIGN KEY ("competition_id","season_id") REFERENCES "public"."competitions"("competition_id","season_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_events" ADD CONSTRAINT "raw_events_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE no action ON UPDATE no action;