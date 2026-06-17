import { config } from "dotenv";


config();


export  default{
    host: process.env.HOST,
    database: process.env.DATABASE,
    user:process.env.DB_USER || process.env.USER || "",
    password: process.env.PASSWORD || ""
}
