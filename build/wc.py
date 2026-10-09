import sys, re, subprocess
f = sys.argv[1] if len(sys.argv) > 1 else "Tureckie_glagoly_dvizheniya_bez_putanicy.pdf"
t = subprocess.run(["pdftotext", "-enc", "UTF-8", f, "-"], capture_output=True, text=True).stdout
w = re.findall(r"[^\W\d_]+(?:[’'\-][^\W\d_]+)*", t, re.UNICODE)
print("words:", len(w))
