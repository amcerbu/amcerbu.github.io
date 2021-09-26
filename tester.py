import sys
if sys.version_info[0] < 3:
    raise Exception("Python 3 not detected.")
import numpy as np
import matplotlib.pyplot as plt
from sklearn import svm
from scipy import io
for data_name in "mnist", "spam", "cifar10":
    data = io.loadmat("data/%s_data.mat" % data_name)
    print("\nloaded %s data!" % data_name)
    for field in "test_data", "training_data", "training_labels":
        print(field, data[field].shape)



def cutPuzzle(s,L):
	for j in L:
		s = s[:j] + '0' + s[j+1:]
	return s

def descend(L, depth, isLeft):
	pass

def minimize(L, isLeft, depth):
	if solvable(cutPuzzle(L)):
		minimize(descend(L, depth+1, True), True, depth+1)
		minimize(descend(L, depth+1, False), False, depth+1)