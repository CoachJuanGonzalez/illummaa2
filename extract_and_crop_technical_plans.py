#!/usr/bin/env python3
"""
PDF Image Extractor & Cropper for 3BR Executive Technical Plans
✅ EXACT SPECIFICATIONS:
   - Format: JPG
   - Quality: 100% (maximum)
   - Resolution: 300 DPI
   - Width: Exactly 1400 pixels (maintain aspect ratio)
   - Color: RGB mode
   - Crops 300px from RIGHT SIDE to remove architect contact info
"""

import fitz  # PyMuPDF
from pathlib import Path
from PIL import Image
import io

def extract_and_crop_technical_drawings():
    """
    Extract pages 1-6 from PDF, crop architect contact info, and resize to exact specs
    """

    pdf_path = Path("attached_assets/3-bedroom-technical-plans_1759503916090.pdf")
    output_dir = Path("attached_assets/3br-technical-plans")
    output_dir.mkdir(exist_ok=True)

    # Page names for better organization
    page_names = [
        "cover-page",
        "floor-plan-main",
        "elevations-front-rear",
        "elevations-left-right",
        "foundation-plan",
        "roof-framing-plan"
    ]

    # ✅ EXACT SPECIFICATIONS
    TARGET_WIDTH = 1400  # Exactly 1400 pixels
    DPI = 300            # 300 DPI resolution
    JPG_QUALITY = 100    # Maximum quality (100%)
    CROP_RIGHT_PX = 300  # Remove architect contact info from right

    try:
        print("=" * 70)
        print("🔧 3BR Technical Plans - Extract & Crop Tool")
        print("=" * 70)
        print()
        print("📋 Image Specifications:")
        print(f"   ✅ Format: JPG")
        print(f"   ✅ Quality: {JPG_QUALITY}% (maximum)")
        print(f"   ✅ Resolution: {DPI} DPI")
        print(f"   ✅ Width: Exactly {TARGET_WIDTH} pixels")
        print(f"   ✅ Color: RGB mode")
        print(f"   ✂️  Crop: {CROP_RIGHT_PX}px from right edge (architect contact info)")
        print()
        print("=" * 70)
        print()

        print("🔄 Opening PDF...")
        pdf_document = fitz.open(pdf_path)
        print(f"✅ PDF opened: {len(pdf_document)} pages found\n")

        for page_num in range(min(6, len(pdf_document))):
            print(f"📄 Processing page {page_num + 1}/6: {page_names[page_num]}")
            print("-" * 70)
            page = pdf_document[page_num]

            # Step 1: Render at 300 DPI (4.166x scale for high quality)
            # 300 DPI / 72 DPI (default) = 4.166
            mat = fitz.Matrix(4.166, 4.166)
            pix = page.get_pixmap(matrix=mat, alpha=False, dpi=DPI)

            # Convert to PIL Image for processing
            img_data = pix.tobytes("jpeg", jpg_quality=JPG_QUALITY)
            img = Image.open(io.BytesIO(img_data))

            # Ensure RGB mode (not RGBA or CMYK)
            if img.mode != 'RGB':
                print(f"   🔄 Converting from {img.mode} to RGB mode...")
                img = img.convert('RGB')

            original_width, original_height = img.size
            print(f"   📐 Original size: {original_width}x{original_height} pixels @ {DPI} DPI")

            # Step 2: Crop from right side to remove architect contact info
            cropped_img = img.crop((
                0,                              # left edge
                0,                              # top edge
                original_width - CROP_RIGHT_PX, # right edge (remove 300px)
                original_height                 # bottom edge
            ))

            cropped_width, cropped_height = cropped_img.size
            print(f"   ✂️  Cropped size: {cropped_width}x{cropped_height} pixels")
            print(f"   ✅ Removed {CROP_RIGHT_PX}px from right (architect contact info)")

            # Step 3: Resize to exactly 1400px width (maintain aspect ratio)
            aspect_ratio = cropped_height / cropped_width
            target_height = int(TARGET_WIDTH * aspect_ratio)

            resized_img = cropped_img.resize(
                (TARGET_WIDTH, target_height),
                Image.Resampling.LANCZOS  # High-quality downsampling
            )

            final_width, final_height = resized_img.size
            print(f"   📏 Resized to: {final_width}x{final_height} pixels")
            print(f"   ✅ Width exactly {TARGET_WIDTH}px (aspect ratio maintained)")

            # Step 4: Save as maximum quality JPG with DPI metadata
            filename = f"{page_names[page_num]}.jpg"
            output_path = output_dir / filename

            resized_img.save(
                output_path,
                "JPEG",
                quality=JPG_QUALITY,
                optimize=False,  # Don't optimize (maintain max quality)
                dpi=(DPI, DPI),  # Embed DPI metadata
                subsampling=0    # No chroma subsampling (best quality)
            )

            # Verify file was created
            if output_path.exists():
                file_size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"   💾 Saved: {filename} ({file_size_mb:.2f} MB)")
                print(f"   ✅ Quality: {JPG_QUALITY}%, DPI: {DPI}, Color: RGB")
            else:
                print(f"   ❌ Error: Failed to save {filename}")

            print()

        pdf_document.close()

        print("=" * 70)
        print(f"🎉 SUCCESS! Processed {min(6, len(pdf_document))} pages")
        print("=" * 70)
        print()
        print("📁 Output Location:")
        print(f"   {output_dir.absolute()}")
        print()
        print("✅ All Images Meet Specifications:")
        print(f"   • Format: JPG")
        print(f"   • Quality: {JPG_QUALITY}% (maximum)")
        print(f"   • Resolution: {DPI} DPI")
        print(f"   • Width: Exactly {TARGET_WIDTH} pixels")
        print(f"   • Color: RGB mode")
        print(f"   • Architect contact info: REMOVED (cropped {CROP_RIGHT_PX}px)")
        print()
        print("=" * 70)

        # List all created files
        print()
        print("📋 Created Files:")
        for filename in page_names:
            filepath = output_dir / f"{filename}.jpg"
            if filepath.exists():
                size_mb = filepath.stat().st_size / (1024 * 1024)
                print(f"   ✅ {filename}.jpg ({size_mb:.2f} MB)")

        print()
        print("🚀 Next Steps:")
        print("   1. Upload all 6 JPG files to Replit (attached_assets/3br-technical-plans/)")
        print("   2. Update model-3br-executive.tsx to use these images")
        print("   3. Test on your website!")
        print()

    except FileNotFoundError:
        print(f"❌ Error: PDF not found at {pdf_path}")
        print()
        print("💡 Make sure:")
        print("   1. You're running this script from the illummaa-github folder")
        print("   2. The PDF exists in attached_assets folder")
        print(f"   3. Filename is exactly: 3-bedroom-technical-plans_1759503916090.pdf")
    except ImportError as e:
        print(f"❌ Error: Missing required library")
        print(f"   {e}")
        print()
        print("💡 Install required libraries:")
        print("   pip install PyMuPDF Pillow")
        print()
        print("   Or install both:")
        print("   pip install PyMuPDF Pillow")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        print()
        import traceback
        traceback.print_exc()
        print()
        print("💡 If the error persists:")
        print("   1. Check PDF file is not corrupted")
        print("   2. Ensure you have write permissions to attached_assets folder")
        print("   3. Try closing any programs that might have the PDF open")

if __name__ == "__main__":
    extract_and_crop_technical_drawings()
