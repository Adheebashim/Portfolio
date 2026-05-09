import sys
try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    from pypdf import PdfReader, PdfWriter

def rotate_pdf(filepath):
    print(f"Processing {filepath}...")
    reader = PdfReader(filepath)
    writer = PdfWriter()

    for page in reader.pages:
        # Rotate 180 degrees to fix the upside-down orientation.
        page.rotate(180)
        writer.add_page(page)

    with open(filepath, "wb") as f:
        writer.write(f)
    print(f"Successfully rotated {filepath}")

if __name__ == "__main__":
    files_to_rotate = ["Udacity_Certification.pdf", "Python101.pdf"]
    for file in files_to_rotate:
        try:
            rotate_pdf(file)
        except Exception as e:
            print(f"Error processing {file}: {e}")
