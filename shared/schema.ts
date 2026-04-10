import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}) as any;


export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Blog table
export const blogs = pgTable("blogs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image_url: text("image_url"),
  author: text("author").notNull(),
  category: text("category").notNull(),
  is_published: boolean("is_published").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertBlogSchema = createInsertSchema(blogs) as any;

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;

// Reunited Stories table
export const reunitedStories = pgTable("reunited_stories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pet_name: text("pet_name").notNull(),
  pet_type: text("pet_type").notNull(),
  story_title: text("story_title").notNull(),
  story_content: text("story_content").notNull(),
  image_url: text("image_url"),
  reunited_date: timestamp("reunited_date"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertReunitedStorySchema = createInsertSchema(reunitedStories) as any;

export type InsertReunitedStory = z.infer<typeof insertReunitedStorySchema>;
export type ReunitedStory = typeof reunitedStories.$inferSelect;

// FAQ table
export const faqs = pgTable("faqs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertFaqSchema = createInsertSchema(faqs) as any;

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Features table
export const features = pgTable("features", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertFeatureSchema = createInsertSchema(features) as any;

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type Feature = typeof features.$inferSelect;

// Pricing table
export const pricing = pgTable("pricing", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  billing_period: text("billing_period").notNull(),
  features: text("features").notNull(), // JSON array as string
  is_popular: boolean("is_popular").default(false),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertPricingSchema = createInsertSchema(pricing) as any;

export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type Pricing = typeof pricing.$inferSelect;

// How It Works table
export const howItWorks = pgTable("how_it_works", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  step_number: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertHowItWorksSchema = createInsertSchema(howItWorks) as any;

export type InsertHowItWorks = z.infer<typeof insertHowItWorksSchema>;
export type HowItWorks = typeof howItWorks.$inferSelect;

// Who It's For table
export const whoItsFor = pgTable("who_its_for", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  order_index: integer("order_index").default(0),
  is_published: boolean("is_published").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertWhoItsForSchema = createInsertSchema(whoItsFor) as any;

export type InsertWhoItsFor = z.infer<typeof insertWhoItsForSchema>;
export type WhoItsFor = typeof whoItsFor.$inferSelect;
