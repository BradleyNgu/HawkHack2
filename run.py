import os
cwd = os.getcwd() #cwd = current working directory
#cwd = "cd " + cwd
print(f"{cwd}")

os.chdir(cwd)
os.chdir("client")

os.system("npm run build")
os.chdir("..")
os.system("node server.js")

print("done") #for da vs code