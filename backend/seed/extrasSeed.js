import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from "slugify";

import MarketplaceItem from '../models/MarketplaceItem.model.js';
import Writeup from '../models/Writeup.model.js';
import Job from '../models/Job.model.js';
import KBArticle from '../models/KBArticle.model.js';
import BreachAlert from '../models/BreachAlert.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const runSeed = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    console.log("🚮 Clearing old data...");
    await MarketplaceItem.deleteMany({});
    await Writeup.deleteMany({});
    await Job.deleteMany({});
    await KBArticle.deleteMany({});
    await BreachAlert.deleteMany({});

    console.log("🌱 Seeding Marketplace...");
    await MarketplaceItem.insertMany([
      {
        title: "Pentesting Toolkit",
        description: "Collection of scripts & automation tools.",
        price: 49,
        category: "tools",
        seller: "Admin"
      },
      {
        title: "OSINT Mega Pack",
        description: "All-in-one OSINT automation scripts.",
        price: 29,
        category: "osint",
        seller: "Kaavach AI"
      }
    ]);

    console.log("🌱 Seeding Writeups...");
    await Writeup.insertMany([
      {
        title: "XSS on Login Page",
        author: "Alice",
        tags: ["xss", "web"],
        content: "Found a reflected XSS vulnerability due to missing sanitization."
      },
      {
        title: "Critical IDOR in APIs",
        author: "Bob",
        tags: ["idor", "api"],
        content: "IDOR discovered in user profile update endpoint."
      }
    ]);

    console.log("🌱 Seeding Jobs...");
    await Job.insertMany([
      {
        title: "Security Researcher",
        company: "CyberCorp",
        location: "Remote",
        type: "full-time",
        salaryRange: { min: 90000, max: 120000 }
      },
      {
        title: "Bug Bounty Hunter (Contract)",
        company: "SecHub",
        location: "Remote",
        type: "contract",
        salaryRange: { min: 30, max: 60 }
      }
    ]);

        console.log("🌱 Seeding Knowledge Base...");

        await KBArticle.insertMany([
        {
            title: "How to Find SQL Injection",
            slug: slugify("How to Find SQL Injection", { lower: true, strict: true }),
            category: "Web Security",
            content: "Step-by-step methodology for identifying SQLi vulnerabilities.",
            tags: ["sqli", "manual-testing"]
        },
        {
            title: "Secure Coding Best Practices",
            slug: slugify("Secure Coding Best Practices", { lower: true, strict: true }),
            category: "Development",
            content: "Top 10 best practices for secure software development.",
            tags: ["secure-coding"]
        }
        ]);

    console.log("🌱 Seeding Breach Alerts...");
    await BreachAlert.insertMany([
      {
        source: "HaveIBeenPwned",
        affectedDomain: "example.com",
        breachType: "Password Leak",
        severity: "high"
      },
      {
        source: "Dark Web Monitor",
        affectedDomain: "company.com",
        breachType: "Database Dump",
        severity: "critical"
      }
    ]);

    console.log("🎉 Seeding Completed!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

runSeed();
