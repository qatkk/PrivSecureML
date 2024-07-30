import subprocess



compile  = subprocess.run(['zokrates compile -i main.zok'], stdout=subprocess.PIPE, shell=True, text=True)
print("compute compile result", compile.stdout)

# constraints  = subprocess.run(['zokrates inspect'], stdout=subprocess.PIPE, shell=True, text=True)
# print(constraints.stdout)

setup = subprocess.run(['zokrates setup'], stdout=subprocess.PIPE, shell=True, text=True)
print("compute setup result", setup.stdout)


setup = subprocess.run(['zokrates export-verifier'], stdout=subprocess.PIPE, shell=True, text=True)
print("compute setup result", setup.stdout)


subprocess.run(['cp verifier.sol ../Contracts'], stdout=subprocess.PIPE, shell=True, text=True)

