import express from "express";
import {upload} from "./multer.js"; // Use your custom multer config

export function dualBodyParser(fieldName = "file") {
  return (req, res, next) => {
    if (req.is("multipart/form-data")) {
      upload.single(fieldName)(req, res, next);
    } else {
      express.json()(req, res, next);
    }
  };
}