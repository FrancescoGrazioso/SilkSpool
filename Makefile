# Silk Spool Development Makefile

.PHONY: help install dev build test lint format clean

# Default target
help:
	@echo "Silk Spool Development Commands:"
	@echo ""
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linting (TypeScript + Rust)"
	@echo "  make format     - Format code (TypeScript + Rust)"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make release    - Build release files"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd silk-spool && npm install
	cd silk-spool/src-tauri && cargo check

# Development
dev:
	@echo "Starting development server..."
	cd silk-spool && npm run tauri dev

# Build
build:
	@echo "Building application..."
	cd silk-spool && npm run build
	cd silk-spool && npm run tauri build

# Testing
test:
	@echo "Running tests..."
	cd silk-spool && npm run test:run
	cd silk-spool/src-tauri && cargo test

# Linting
lint:
	@echo "Running TypeScript linting..."
	cd silk-spool && npm run lint
	@echo "Running Rust linting..."
	cd silk-spool/src-tauri && cargo clippy --all-targets --all-features

# Formatting
format:
	@echo "Formatting TypeScript..."
	cd silk-spool && npm run format
	@echo "Formatting Rust..."
	cd silk-spool/src-tauri && cargo fmt --all

# Clean
clean:
	@echo "Cleaning build artifacts..."
	cd silk-spool && rm -rf dist node_modules/.vite
	cd silk-spool/src-tauri && cargo clean
	rm -rf releases/

# Release
release:
	@echo "Building release..."
	./build-release.sh
