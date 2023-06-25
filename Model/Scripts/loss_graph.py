import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

#create a dataframe from the log csv file of the lines that have the format "{'loss': 15.6504, 'learning_rate': 2.0000000000000003e-06, 'epoch': 0.0}"
df = pd.read_csv('loss_logs.csv', delimiter=',\s', header=None, names=['loss', 'learning_rate', 'epoch'])

#drop the first row
df = df.drop([0])

#clean the rows
df['loss'] = df['loss'].str.replace('{\'loss\': ', '')
df['loss'] = df['loss'].str.replace('"', '')
df['learning_rate'] = df['learning_rate'].str.replace('\'learning_rate\': ', '')
df['epoch'] = df['epoch'].str.replace('\'epoch\': ', '')
df['epoch'] = df['epoch'].str.replace('}"', '')

print(df.head())

#convert the columns to float
df['loss'] = df['loss'].astype(float)
df['learning_rate'] = df['learning_rate'].astype(float)
df['epoch'] = df['epoch'].astype(float)

#plot the losses and the learning rate using matplotlib using a logarithmic scale
#multiply the training step by 20 to get the number of training steps
df['training_step'] = np.arange(0, len(df)*20, 20)
plt.plot(df['training_step'], df['loss'])
plt.plot(df['training_step'], df['learning_rate'])
plt.xlabel('Training step')
plt.ylabel('Loss/Learning rate')
plt.yscale('log')
plt.legend(['Loss', 'Learning rate'])
plt.savefig('loss_graph.png')
plt.rcParams["figure.figsize"] = (40,20)
#change the thickness of the lines
plt.rcParams['lines.linewidth'] = 2
plt.rcParams['axes.linewidth'] = 5
plt.rcParams['xtick.major.width'] = 5
plt.rcParams['ytick.major.width'] = 5
plt.rcParams['xtick.minor.width'] = 5
plt.rcParams['ytick.minor.width'] = 5
plt.rcParams['xtick.major.size'] = 20
plt.rcParams['ytick.major.size'] = 20
plt.rcParams['xtick.minor.size'] = 20
plt.rcParams['ytick.minor.size'] = 20
plt.show()
#save the plot

