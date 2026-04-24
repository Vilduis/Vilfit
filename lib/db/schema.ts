import {
  pgTable,
  text,
  integer,
  timestamp,
  json,
  pgEnum,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["candidate", "recruiter"])

export const jobTypeEnum = pgEnum("job_type", [
  "full-time",
  "part-time",
  "remote",
  "hybrid",
])

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "active",
  "closed",
])

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
])

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "free",
  "active",
  "cancelled",
])

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  role: userRoleEnum("role"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company"),
  description: text("description"),
  website: text("website"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .default("free")
    .notNull(),
})

export const jobOffers = pgTable("job_offers", {
  id: text("id").primaryKey(),
  recruiterId: text("recruiter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location"),
  salaryRange: text("salary_range"),
  type: jobTypeEnum("type").default("full-time").notNull(),
  status: jobStatusEnum("status").default("draft").notNull(),
  screeningQuestions: json("screening_questions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobOfferId: text("job_offer_id")
    .notNull()
    .references(() => jobOffers.id, { onDelete: "cascade" }),
  cvUrl: text("cv_url").notNull(),
  status: applicationStatusEnum("status").default("pending").notNull(),
  matchScore: integer("match_score"),
  aiAnalysis: json("ai_analysis").$type<{
    strengths: string[]
    gaps: string[]
    summary: string
    recommendation: "hire" | "maybe" | "pass"
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const screeningAnswers = pgTable("screening_answers", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
})

export const candidateProfiles = pgTable("candidate_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
})

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  recruiterId: text("recruiter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").default("free").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type JobOffer = typeof jobOffers.$inferSelect
export type NewJobOffer = typeof jobOffers.$inferInsert
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
export type RecruiterProfile = typeof recruiterProfiles.$inferSelect
export type CandidateProfile = typeof candidateProfiles.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
