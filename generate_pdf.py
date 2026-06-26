import re
import sys
from datetime import datetime
from fpdf import FPDF

class ClimateTwinPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_margins(15, 20, 15)
        self.set_auto_page_break(auto=True, margin=20)
        self.heading_pages = {}

    def header(self):
        if self.page_no() == 1:
            return  # Cover page has no header
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, 'ClimateTwin India - Technical Overview & Comprehensive Documentation', border=0, align='R', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        if self.page_no() == 1:
            return  # Cover page has no footer
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        # Left-aligned date, Right-aligned page number
        self.cell(100, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d')}", border=0, align='L')
        self.cell(0, 10, f'Page {self.page_no()}', border=0, align='R')

    def cover_page(self):
        self.add_page()
        # Draw background decoration (slate-900)
        self.set_fill_color(15, 23, 42)
        self.rect(0, 0, 210, 297, 'F')
        
        # Decorative sidebar (teal/sky)
        self.set_fill_color(14, 165, 233)
        self.rect(15, 30, 6, 120, 'F')
        
        # Title
        self.set_font('Helvetica', 'B', 32)
        self.set_text_color(255, 255, 255)
        self.set_xy(30, 50)
        self.multi_cell(165, 12, "ClimateTwin India")
        
        # Subtitle
        self.set_font('Helvetica', '', 18)
        self.set_text_color(14, 165, 233)
        self.set_xy(30, 80)
        self.cell(165, 10, "Technical Overview & Documentation")
        
        self.set_font('Helvetica', 'I', 12)
        self.set_text_color(148, 163, 184)
        self.set_xy(30, 92)
        self.cell(165, 10, "AI-Powered Digital Twin of India's Climate")
        
        # Horizontal line
        self.set_draw_color(51, 65, 85)
        self.line(30, 115, 190, 115)
        
        # Metadata block
        self.set_font('Helvetica', '', 11)
        self.set_text_color(148, 163, 184)
        self.set_xy(30, 170)
        self.cell(165, 8, "Classification: Classified Environmental Data Platform")
        self.set_xy(30, 178)
        self.cell(165, 8, "Target Audience: Policy Planners, Researchers & Disaster Authorities")
        self.set_xy(30, 186)
        self.cell(165, 8, "Project Repository: https://github.com/sumitsinha09-stack/IndiClima-Twin")
        
        # Bottom Author Box
        self.set_fill_color(30, 41, 59)
        self.rect(30, 220, 150, 32, 'F')
        self.set_text_color(255, 255, 255)
        self.set_xy(35, 224)
        self.set_font('Helvetica', 'B', 10)
        self.cell(140, 6, "Lead Contributor & Author")
        self.set_xy(35, 232)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(14, 165, 233)
        self.cell(140, 6, "sumitsinha09-stack (sinsumit157@gmail.com)")
        self.set_xy(35, 240)
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(148, 163, 184)
        self.cell(140, 6, f"Published: {datetime.now().strftime('%B %d, %Y')} | Version 1.0.0")

def clean_markdown_formatting(text):
    # Remove bold markdown **
    text = re.sub(re.escape("**"), "", text)
    text = re.sub(r'\*\*(.*?)\*\* ', r'\1', text)
    # Remove inline backticks `
    text = text.replace("`", "")
    # Clean up non-ASCII characters to prevent PDF compiler errors
    text = text.replace("—", " - ")
    text = text.replace("–", " - ")
    text = text.replace("°", " degrees ")
    text = text.replace("&deg;", " degrees ")
    text = text.replace("©", " (c) ")
    text = text.replace("&copy;", " (c) ")
    text = text.replace("↓", " -> ")
    text = text.replace("→", " -> ")
    text = text.replace("•", " * ")
    
    # Formulas cleanup for text rendering
    text = text.replace("Δ", " Delta ")
    text = text.replace("T_{surf}", " T_surface ")
    text = text.replace("C_{CO2}", " C_CO2 ")
    text = text.replace("Δ_{rain}", " Delta_rain ")
    text = text.replace("def_{pct}", " def_pct ")
    text = text.replace("urb_{pct}", " urb_pct ")
    text = text.replace("co2_{change}", " co2_change ")
    
    # Strip any remaining non-ASCII characters
    text = text.encode("ascii", "ignore").decode("ascii")
    return text

def parse_markdown_to_pdf(md_path, pdf_path):
    # Pass 1: Parse headers and build static Table of Contents data
    toc_entries = []
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Pre-render logic to identify section locations
    # We will do a direct page-tracking write pass.
    pdf = ClimateTwinPDF()
    pdf.cover_page()
    
    # 2. Add Table of Contents Page
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.line(15, 32, 195, 32)
    pdf.ln(8)
    
    # We'll write the TOC entries after rendering by keeping placeholders, 
    # but a simpler way is to pre-allocate pages for TOC, render the document,
    # collect page numbers, and then compile the final PDF.
    
    # Let's run a two-pass rendering:
    # Pass 1: Renders the entire document without TOC to get actual page numbers for each heading.
    # Pass 2: Renders the document including the TOC with accurate page numbers.
    
    def render_content(pdf_instance, store_pages=False):
        in_code_block = False
        code_lines = []
        table_lines = []
        in_table = False
        
        for line in lines:
            line_str = line.strip()
            
            # Code block handling
            if line_str.startswith("```"):
                if in_code_block:
                    in_code_block = False
                    pdf_instance.set_fill_color(241, 245, 249) # slate-100
                    pdf_instance.set_font('Courier', '', 9)
                    pdf_instance.set_text_color(51, 65, 85)
                    # Join code lines and display, cleaning unicode characters
                    code_text = "".join(code_lines)
                    code_text = code_text.replace("┌", "+").replace("┐", "+").replace("└", "+").replace("┘", "+")
                    code_text = code_text.replace("─", "-").replace("│", "|").replace("▲", "^").replace("▼", "v")
                    code_text = code_text.replace("├", "+").replace("┤", "+").replace("┬", "+").replace("┴", "+").replace("┼", "+")
                    code_text = code_text.replace("↓", "v").replace("→", "->")
                    code_text = code_text.encode("ascii", "ignore").decode("ascii")
                    pdf_instance.multi_cell(0, 4.5, code_text, border=1, fill=True)
                    pdf_instance.ln(4)
                    code_lines = []
                else:
                    in_code_block = True
                continue
                
            if in_code_block:
                code_lines.append(line)
                continue
                
            # Table handling
            if line_str.startswith("|"):
                # If table divider line like |---|---|
                if "---" in line_str:
                    continue
                in_table = True
                table_lines.append(line_str)
                continue
            elif in_table and not line_str.startswith("|"):
                # Render table
                in_table = False
                render_pdf_table(pdf_instance, table_lines)
                table_lines = []
                
            # Headings
            if line_str.startswith("#"):
                match = re.match(r'^(#+)\s*(.*)', line_str)
                if match:
                    level = len(match.group(1))
                    title = clean_markdown_formatting(match.group(2))
                    
                    if store_pages:
                        pdf_instance.heading_pages[title] = pdf_instance.page_no()
                        
                    if level == 1:
                        pdf_instance.add_page()
                        pdf_instance.set_font('Helvetica', 'B', 18)
                        pdf_instance.set_text_color(14, 165, 233) # teal
                        pdf_instance.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
                        pdf_instance.ln(4)
                    elif level == 2:
                        pdf_instance.ln(4)
                        pdf_instance.set_font('Helvetica', 'B', 13)
                        pdf_instance.set_text_color(15, 23, 42) # dark slate
                        pdf_instance.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
                        pdf_instance.ln(2)
                    elif level == 3:
                        pdf_instance.ln(3)
                        pdf_instance.set_font('Helvetica', 'B', 11)
                        pdf_instance.set_text_color(51, 65, 85)
                        pdf_instance.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
                        pdf_instance.ln(2)
                    else:
                        pdf_instance.ln(2)
                        pdf_instance.set_font('Helvetica', 'B', 10)
                        pdf_instance.set_text_color(100, 116, 139)
                        pdf_instance.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
                        pdf_instance.ln(1)
                continue
                
            # Bullet lists
            if line_str.startswith("* ") or line_str.startswith("- "):
                bullet_text = line_str[2:]
                cleaned_text = clean_markdown_formatting(bullet_text)
                pdf_instance.set_font('Helvetica', '', 10)
                pdf_instance.set_text_color(51, 65, 85)
                # Bullet character (draw a solid square bullet)
                current_x = pdf_instance.get_x()
                current_y = pdf_instance.get_y()
                pdf_instance.set_fill_color(14, 165, 233)
                pdf_instance.rect(current_x + 2, current_y + 2, 2, 2, 'F')
                pdf_instance.set_xy(current_x + 8, current_y)
                pdf_instance.multi_cell(0, 5, cleaned_text)
                pdf_instance.ln(1)
                continue
                
            # Standard paragraphs
            if line_str:
                cleaned_text = clean_markdown_formatting(line_str)
                pdf_instance.set_font('Helvetica', '', 10)
                pdf_instance.set_text_color(51, 65, 85)
                pdf_instance.multi_cell(0, 5, cleaned_text)
                pdf_instance.ln(2.5)

    def render_pdf_table(pdf_instance, table_lines):
        if not table_lines:
            return
        parsed_rows = []
        for row_str in table_lines:
            cols = [c.strip() for c in row_str.split("|")[1:-1]]
            parsed_rows.append([clean_markdown_formatting(c) for c in cols])
            
        if not parsed_rows:
            return
            
        # Draw table using fpdf2 table feature
        pdf_instance.set_font('Helvetica', '', 9)
        pdf_instance.set_text_color(51, 65, 85)
        
        with pdf_instance.table() as table:
            # Header Row
            header_row = table.row()
            pdf_instance.set_font('Helvetica', 'B', 9)
            pdf_instance.set_text_color(15, 23, 42)
            for cell_text in parsed_rows[0]:
                header_row.cell(cell_text)
                
            # Content Rows
            pdf_instance.set_font('Helvetica', '', 8.5)
            pdf_instance.set_text_color(51, 65, 85)
            for row in parsed_rows[1:]:
                row_cells = table.row()
                for cell_text in row:
                    row_cells.cell(cell_text)
        pdf_instance.ln(4)

    # ==================== RUN PASS 1 ====================
    # Pass 1 gathers actual page positions of headings in a dummy render
    pass1_pdf = ClimateTwinPDF()
    pass1_pdf.cover_page()
    pass1_pdf.add_page() # Placeholder for TOC
    render_content(pass1_pdf, store_pages=True)
    
    # Headings mapping from Pass 1
    heading_pages = pass1_pdf.heading_pages
    
    # ==================== RUN PASS 2 ====================
    # Pass 2 compiles the final PDF with TOC rendered
    final_pdf = ClimateTwinPDF()
    final_pdf.cover_page()
    
    # Add TOC Page
    final_pdf.add_page()
    final_pdf.set_font('Helvetica', 'B', 20)
    final_pdf.set_text_color(15, 23, 42)
    final_pdf.cell(0, 10, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
    final_pdf.set_draw_color(14, 165, 233)
    final_pdf.line(15, 32, 195, 32)
    final_pdf.ln(8)
    
    # Renders Table of Contents rows
    final_pdf.set_font('Helvetica', '', 11)
    for title, page_num in heading_pages.items():
        # Match only numbered main sections to keep TOC clean
        if re.match(r'^\d+\.', title):
            title_text = title
            page_str = str(page_num)
            
            # Dot leader sizing
            dot_space = 180 - final_pdf.get_x() - final_pdf.get_string_width(title_text) - final_pdf.get_string_width(page_str)
            dots = "." * int(dot_space / final_pdf.get_string_width("."))
            
            final_pdf.set_text_color(15, 23, 42)
            final_pdf.cell(0, 8, f"{title_text} {dots} {page_str}", new_x="LMARGIN", new_y="NEXT")
            
    # Render actual content pages in Pass 2
    render_content(final_pdf, store_pages=False)
    
    # Output to disk
    final_pdf.output(pdf_path)

if __name__ == "__main__":
    md_file = "climatetwin_documentation.md"
    pdf_file = "climatetwin_documentation.pdf"
    
    print(f"Reading markdown source from '{md_file}'...")
    print(f"Compiling PDF using fpdf2...")
    try:
        parse_markdown_to_pdf(md_file, pdf_file)
        print(f"PDF generated successfully: '{pdf_file}'")
    except Exception as e:
        print(f"Error compiling PDF: {e}")
        sys.exit(1)
