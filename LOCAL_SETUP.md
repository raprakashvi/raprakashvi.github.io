# Running the Website Locally

## Quick Start

1. **Navigate to the website directory:**
   ```bash
   cd /Users/rp/rp-repo/Website
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   bundle install --path vendor/bundle
   ```
   
   If you get permission errors, you can also try:
   ```bash
   bundle config set --local path 'vendor/bundle'
   bundle install
   ```

3. **Start the Jekyll server:**
   ```bash
   bundle exec jekyll serve
   ```
   
   Or if you want live reload (auto-refresh on file changes):
   ```bash
   bundle exec jekyll serve --livereload
   ```

4. **View your website:**
   Open your browser and go to: **http://localhost:4000**

5. **Stop the server:**
   Press `Ctrl+C` in the terminal

## Alternative: Using Jekyll Directly

If bundle install doesn't work, you can try installing Jekyll globally (though this is not recommended):

```bash
gem install jekyll bundler
bundle install
bundle exec jekyll serve
```

## Troubleshooting

### Permission Errors
If you get permission errors with the system Ruby, consider using a Ruby version manager:
- **rbenv**: `brew install rbenv ruby-build`
- **rvm**: `curl -sSL https://get.rvm.io | bash`

### Port Already in Use
If port 4000 is already in use, specify a different port:
```bash
bundle exec jekyll serve --port 4001
```

### Dependencies Not Found
If you see dependency errors, try:
```bash
bundle clean
bundle install
```

## Notes

- The site will automatically rebuild when you make changes to files
- The `--livereload` flag will automatically refresh your browser when files change
- Jekyll serves the site in development mode by default (shows drafts, etc.)

