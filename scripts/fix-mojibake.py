import os

filepath = 'src/components/report/FactFinderPDF.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the mangled utf8 sequence â€” which happens when em-dash is double-encoded
content = content.replace('â€”', '—')
content = content.replace('â€“', '—')
content = content.replace('â€œ', '"')
content = content.replace('â€', '"')
content = content.replace('â€˜', "'")
content = content.replace('â€™', "'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Mojibake fixed!")
