import subprocess



compile  = subprocess.run(['zokrates compile -i main.zok'], stdout=subprocess.PIPE, shell=True, text=True)
print("compute compile result", compile.stdout)

constraints  = subprocess.run(['zokrates inspect'], stdout=subprocess.PIPE, shell=True, text=True)
print(constraints.stdout)

# setup = subprocess.run(['zokrates setup'], stdout=subprocess.PIPE, shell=True, text=True)
# print("compute setup result", setup.stdout)


subprocess.run(['mkdir 100_5_90'], stdout=subprocess.PIPE, shell=True, text=True)

subprocess.run(['cp out ./100_5_90'], stdout=subprocess.PIPE, shell=True, text=True)
subprocess.run(['cp out.ztf ./100_5_90'], stdout=subprocess.PIPE, shell=True, text=True)
# subprocess.run(['cp proving.key ./100_5_55'], stdout=subprocess.PIPE, shell=True, text=True)
# subprocess.run(['cp verification.key ./100_5_55'], stdout=subprocess.PIPE, shell=True, text=True)


