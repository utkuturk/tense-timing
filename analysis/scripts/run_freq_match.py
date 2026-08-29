from wordfreq import zipf_frequency
import pandas as pd

# helpers
def zipf_to_wpm(z):
    return 10**z / 1000.0

def get_freq_wpm(word):
    z = zipf_frequency(word, 'en')
    return zipf_to_wpm(z)

def bin_freq_fixed(x):
    if x >= 100:  return "high"
    if x >= 20:   return "medium"
    return "low"

# verbs (NEW LISTS from main.js)
irregulars = ["cut", "build", "sweep", "ride", "drink", "throw", "break", "eat", "dig"]
regulars = ["paint", "kick", "play", "wash", "stir", "climb", "push", "peel", "smell"]

rows = []
for v in irregulars:
    rows.append(("irregular","unerg",v,get_freq_wpm(v)))
for v in regulars:
    rows.append(("regular","unerg",v,get_freq_wpm(v)))

df = pd.DataFrame(rows, columns=["Regularity","VerbType","Verb","FreqWPM"])

# Binning
df["FreqBin"] = df["FreqWPM"].apply(bin_freq_fixed)

reg = df[df.Regularity=="regular"].copy().reset_index(drop=True)
irr = df[df.Regularity=="irregular"].copy().reset_index(drop=True)

out_rows = []
for bin_level in ["high","medium","low","unknown"]:
    reg_bin = reg[reg.FreqBin==bin_level].reset_index(drop=True)
    irr_bin = irr[irr.FreqBin==bin_level].reset_index(drop=True)
    max_len = max(len(reg_bin), len(irr_bin))
    for i in range(max_len):
        reg_verb  = reg_bin.loc[i,"Verb"] if i < len(reg_bin) else ""
        irr_verb  = irr_bin.loc[i,"Verb"] if i < len(irr_bin) else ""
        reg_freq  = round(reg_bin.loc[i,"FreqWPM"], 3) if i < len(reg_bin) else ""
        irr_freq  = round(irr_bin.loc[i,"FreqWPM"], 3) if i < len(irr_bin) else ""
        out_rows.append((bin_level, reg_verb, irr_verb, reg_freq, irr_freq))

pairs = pd.DataFrame(out_rows, columns=["freqbin","reg_verb","irreg_verb","regfreq","irregfreq"])

print("--- Generated Pairs ---")
print(pairs.to_string())
