/**
 * Central glossary of abbreviations and acronyms used across the Atlas.
 * Definitions are written for a high-school audience.
 *
 * Each entry has:
 * - term: the abbreviation/acronym as it appears in text
 * - expansion: what the letters stand for
 * - definition: plain-language explanation
 * - aliases: alternative forms that should also match (optional)
 */

export interface GlossaryEntry {
  term: string;
  expansion: string;
  definition: string;
  aliases?: string[];
}

export const glossary: GlossaryEntry[] = [
  // ── Core ML/AI ──
  { term: "AI", expansion: "Artificial Intelligence", definition: "Computer systems that can perform tasks that normally require human thinking, like recognizing images or understanding language." },
  { term: "ML", expansion: "Machine Learning", definition: "A branch of AI where computers learn patterns from data instead of being explicitly programmed with rules." },
  { term: "DL", expansion: "Deep Learning", definition: "A type of machine learning that uses neural networks with many layers to learn complex patterns from large amounts of data." },
  { term: "RL", expansion: "Reinforcement Learning", definition: "A type of ML where an agent learns by trial and error, receiving rewards for good actions and penalties for bad ones — like training a dog with treats." },
  { term: "NLP", expansion: "Natural Language Processing", definition: "Teaching computers to understand, interpret, and generate human language — the technology behind chatbots and translation tools." },

  // ── Neural network architectures ──
  { term: "CNN", expansion: "Convolutional Neural Network", definition: "A neural network designed for images. It slides small filters across the image to detect patterns like edges, textures, and shapes, building up from simple features to complex ones." },
  { term: "RNN", expansion: "Recurrent Neural Network", definition: "A neural network for sequential data (text, time series) that has a 'memory' — it processes one item at a time and passes information forward to the next step." },
  { term: "GRU", expansion: "Gated Recurrent Unit", definition: "A simpler version of LSTM that uses gates to control what information to keep or forget, but with fewer parameters so it trains faster." },
  { term: "LSTM", expansion: "Long Short-Term Memory", definition: "A type of RNN with special gates that help it remember important information over long sequences without forgetting — solving the 'vanishing gradient' problem." },
  { term: "GNN", expansion: "Graph Neural Network", definition: "A neural network that works on graph-structured data (nodes and edges), like social networks or molecules, by passing messages between connected nodes." },
  { term: "GCN", expansion: "Graph Convolutional Network", definition: "A type of GNN that applies convolution-like operations on graphs, aggregating information from a node's neighbors to update its representation." },
  { term: "MLP", expansion: "Multi-Layer Perceptron", definition: "The simplest type of neural network — just layers of neurons stacked on top of each other, where every neuron connects to every neuron in the next layer." },
  { term: "BERT", expansion: "Bidirectional Encoder Representations from Transformers", definition: "A language model that reads text in both directions at once to understand context. It's pretrained on huge amounts of text and can be fine-tuned for specific tasks." },
  { term: "GPT", expansion: "Generative Pre-trained Transformer", definition: "A language model that generates text by predicting the next word, trained on vast amounts of internet text. The architecture behind ChatGPT." },
  { term: "LLM", expansion: "Large Language Model", definition: "A neural network with billions of parameters trained on massive text datasets to understand and generate human language." },
  { term: "DETR", expansion: "Detection Transformer", definition: "An object detection model that uses a transformer architecture instead of traditional anchor boxes, treating detection as a set prediction problem." },
  { term: "UNET", expansion: "U-Net", definition: "A neural network shaped like the letter U, designed for image segmentation. It has an encoder (downsampling) path and a decoder (upsampling) path with skip connections between them.", aliases: ["U-Net", "UNet"] },
  { term: "YOLO", expansion: "You Only Look Once", definition: "A fast object detection model that processes the entire image in one pass, dividing it into a grid and predicting bounding boxes and classes for each cell simultaneously." },
  { term: "DAE", expansion: "Denoising Autoencoder", definition: "A neural network that learns to reconstruct clean data from intentionally corrupted input. By learning to remove noise, it discovers the underlying structure of the data." },
  { term: "FPN", expansion: "Feature Pyramid Network", definition: "A neural network architecture that combines features at different scales (resolutions) to detect objects of various sizes in images." },
  { term: "SWA", expansion: "Stochastic Weight Averaging", definition: "A training technique that averages model weights from multiple training steps to find flatter minima, which often generalize better to new data." },

  // ── Training & optimization ──
  { term: "EMA", expansion: "Exponential Moving Average", definition: "A smoothing technique that gives more weight to recent values. In ML, it's used to keep a running average of model weights during training for more stable predictions." },
  { term: "BCE", expansion: "Binary Cross-Entropy", definition: "A loss function for yes/no classification tasks. It measures how far the model's predicted probability is from the correct answer (0 or 1)." },
  { term: "CE", expansion: "Cross-Entropy", definition: "A loss function that measures how different the model's predicted probabilities are from the true labels. Lower cross-entropy means better predictions." },
  { term: "MSE", expansion: "Mean Squared Error", definition: "A loss function that measures prediction accuracy by averaging the squared differences between predicted and actual values. Penalizes large errors heavily." },
  { term: "MAE", expansion: "Mean Absolute Error", definition: "A loss function that measures the average size of prediction errors without squaring them, treating all errors proportionally." },
  { term: "RMSE", expansion: "Root Mean Squared Error", definition: "The square root of MSE — gives an error measure in the same units as the original data, making it easier to interpret." },
  { term: "KL", expansion: "Kullback-Leibler (divergence)", definition: "A measure of how different one probability distribution is from another. Used in ML to compare a model's predictions to the true distribution." },
  { term: "SGD", expansion: "Stochastic Gradient Descent", definition: "The most basic optimization algorithm for training neural networks — it updates model weights by moving in the direction that reduces the error, using small random batches of data." },
  { term: "LR", expansion: "Learning Rate", definition: "A number that controls how big each weight update step is during training. Too large and training is unstable; too small and it takes forever." },
  { term: "PPO", expansion: "Proximal Policy Optimization", definition: "A reinforcement learning algorithm that updates a policy gradually, preventing changes that are too large and could destabilize training." },
  { term: "RLHF", expansion: "Reinforcement Learning from Human Feedback", definition: "A technique for aligning AI models with human preferences by training a reward model on human ratings, then using RL to optimize the AI's behavior." },
  { term: "SFT", expansion: "Supervised Fine-Tuning", definition: "Training a pretrained model on a smaller, task-specific labeled dataset to adapt it for a particular use case." },
  { term: "TTA", expansion: "Test-Time Augmentation", definition: "Making predictions on multiple transformed versions of the same input (flipped, rotated, etc.) and averaging the results for more robust predictions." },
  { term: "OHEM", expansion: "Online Hard Example Mining", definition: "A training strategy that focuses on the hardest examples — the ones the model gets most wrong — to learn difficult cases faster." },

  // ── Evaluation metrics ──
  { term: "AUC", expansion: "Area Under the Curve", definition: "A metric for classification models. It measures how well the model distinguishes between classes, from 0.5 (random guessing) to 1.0 (perfect)." },
  { term: "ROC", expansion: "Receiver Operating Characteristic", definition: "A graph showing the trade-off between catching true positives and accidentally flagging false positives at different threshold settings." },
  { term: "F1", expansion: "F1 Score", definition: "A metric that balances precision (how many predicted positives are correct) and recall (how many actual positives were found). A score of 1.0 is perfect." },
  { term: "MAP", expansion: "Mean Average Precision", definition: "A metric for ranking and retrieval systems that measures how well the system puts relevant items at the top of the results list." },
  { term: "NDCG", expansion: "Normalized Discounted Cumulative Gain", definition: "A ranking metric that rewards putting the most relevant results at the very top, with diminishing credit for items further down the list." },
  { term: "IoU", expansion: "Intersection over Union", definition: "A metric for object detection and segmentation that measures how much the predicted region overlaps with the true region. 1.0 means perfect overlap." },
  { term: "CRPS", expansion: "Continuous Ranked Probability Score", definition: "A metric for evaluating probabilistic forecasts that measures how well the predicted distribution matches the actual outcome." },
  { term: "QWK", expansion: "Quadratic Weighted Kappa", definition: "A metric that measures agreement between predicted and actual ratings, accounting for chance agreement and penalizing errors proportionally to their severity." },

  // ── Data & preprocessing ──
  { term: "PCA", expansion: "Principal Component Analysis", definition: "A technique that finds the most important directions in high-dimensional data and projects it onto fewer dimensions, keeping as much variation as possible — like finding the best angle to photograph a 3D object in 2D." },
  { term: "SVD", expansion: "Singular Value Decomposition", definition: "A mathematical technique that breaks any matrix into three simpler matrices, revealing its underlying structure. Used for dimensionality reduction, recommendation systems, and data compression." },
  { term: "LDA", expansion: "Linear Discriminant Analysis", definition: "A technique that finds the directions in data that best separate different classes, projecting high-dimensional data to lower dimensions while maximizing class separation." },
  { term: "UMAP", expansion: "Uniform Manifold Approximation and Projection", definition: "A technique for visualizing high-dimensional data in 2D or 3D by preserving the local structure — nearby points in the original space stay nearby in the visualization." },
  { term: "FFT", expansion: "Fast Fourier Transform", definition: "An efficient algorithm for converting a signal from the time domain to the frequency domain — like breaking a musical chord into its individual notes." },
  { term: "DCT", expansion: "Discrete Cosine Transform", definition: "A transform similar to FFT that represents data as a sum of cosine waves at different frequencies. Used in JPEG image compression." },
  { term: "STFT", expansion: "Short-Time Fourier Transform", definition: "A way to analyze how the frequency content of a signal changes over time by applying FFT to small overlapping windows of the signal." },
  { term: "DWT", expansion: "Discrete Wavelet Transform", definition: "A transform that breaks a signal into components at different scales and positions, capturing both frequency and timing information — unlike FFT which loses timing." },
  { term: "CWT", expansion: "Continuous Wavelet Transform", definition: "Like DWT but computed at every possible scale and position, giving a detailed time-frequency picture of a signal." },
  { term: "TF-IDF", expansion: "Term Frequency-Inverse Document Frequency", definition: "A way to measure how important a word is to a document. Words that appear often in one document but rarely across all documents get high scores." },
  { term: "BPE", expansion: "Byte Pair Encoding", definition: "A text tokenization method that starts with individual characters and repeatedly merges the most frequent adjacent pairs, building up a vocabulary of common subwords." },
  { term: "NMS", expansion: "Non-Maximum Suppression", definition: "A post-processing step in object detection that removes duplicate detections of the same object by keeping only the highest-confidence box and removing overlapping ones." },
  { term: "SMOTE", expansion: "Synthetic Minority Oversampling Technique", definition: "A method to balance imbalanced datasets by creating synthetic examples of the underrepresented class, rather than just duplicating existing ones." },

  // ── Models & algorithms ──
  { term: "GBDT", expansion: "Gradient-Boosted Decision Trees", definition: "An ensemble method that builds many small decision trees sequentially, where each new tree focuses on correcting the mistakes of all previous trees combined.", aliases: ["GBM", "GBRT"] },
  { term: "XGBoost", expansion: "Extreme Gradient Boosting", definition: "A fast, optimized implementation of gradient-boosted trees that's been the go-to algorithm for winning tabular data competitions.", aliases: ["XGB"] },
  { term: "LightGBM", expansion: "Light Gradient Boosting Machine", definition: "A gradient-boosted tree framework that's faster than XGBoost on large datasets by using histogram-based splitting and leaf-wise tree growth.", aliases: ["LGBM"] },
  { term: "KNN", expansion: "K-Nearest Neighbors", definition: "A simple algorithm that classifies a new data point by looking at the K closest data points in the training set and taking a majority vote." },
  { term: "SVM", expansion: "Support Vector Machine", definition: "A classification algorithm that finds the best boundary (hyperplane) to separate different classes with the widest possible margin." },
  { term: "RBF", expansion: "Radial Basis Function", definition: "A kernel function shaped like a bell curve, used in SVMs and other algorithms to measure similarity between data points based on their distance." },
  { term: "GMM", expansion: "Gaussian Mixture Model", definition: "A probabilistic model that assumes data comes from a mixture of several Gaussian (bell curve) distributions, each representing a cluster." },
  { term: "HMM", expansion: "Hidden Markov Model", definition: "A statistical model for sequences where the system transitions between hidden states over time, and you can only observe indirect evidence of which state it's in." },
  { term: "CRF", expansion: "Conditional Random Field", definition: "A model for labeling sequences that considers the context of neighboring labels — for example, in named entity recognition, if the previous word is a person's first name, the current word is likely a last name." },
  { term: "RANSAC", expansion: "Random Sample Consensus", definition: "An algorithm that fits a model to data with outliers by randomly picking small subsets, fitting the model, and keeping the fit that explains the most points." },
  { term: "DP", expansion: "Dynamic Programming", definition: "A problem-solving technique that breaks a big problem into smaller overlapping subproblems, solves each once, and stores the results to avoid redundant computation." },
  { term: "MCTS", expansion: "Monte Carlo Tree Search", definition: "A search algorithm for decision-making that builds a game tree by randomly simulating outcomes and focusing exploration on the most promising branches." },
  { term: "MCMC", expansion: "Markov Chain Monte Carlo", definition: "A family of algorithms that generate samples from complex probability distributions by constructing a random walk that eventually visits each state proportionally to its probability." },
  { term: "EKF", expansion: "Extended Kalman Filter", definition: "A version of the Kalman filter that handles nonlinear systems by linearizing them at each step — like using a tangent line to approximate a curve." },

  // ── Adversarial & attacks ──
  { term: "FGSM", expansion: "Fast Gradient Sign Method", definition: "The simplest adversarial attack — it adds a tiny perturbation to an image in the direction that maximizes the model's error, causing misclassification with an almost invisible change." },
  { term: "MI-FGSM", expansion: "Momentum Iterative FGSM", definition: "An improved version of FGSM that applies multiple small steps instead of one big step, using momentum (like a rolling ball) to produce adversarial examples that transfer better to other models.", aliases: ["MIM"] },
  { term: "PGD", expansion: "Projected Gradient Descent", definition: "An iterative adversarial attack that repeatedly takes gradient steps and projects back onto the allowed perturbation set, producing stronger attacks than single-step FGSM." },

  // ── Signal processing ──
  { term: "ECG", expansion: "Electrocardiogram", definition: "A recording of the heart's electrical activity over time, showing the rhythmic pattern of heartbeats as waves on a graph." },
  { term: "EEG", expansion: "Electroencephalogram", definition: "A recording of the brain's electrical activity using sensors on the scalp, used to study brain function and diagnose neurological conditions." },
  { term: "PPG", expansion: "Photoplethysmogram", definition: "A signal measured by shining light through the skin (like in a smartwatch) to detect blood volume changes with each heartbeat." },
  { term: "HRV", expansion: "Heart Rate Variability", definition: "The variation in time between consecutive heartbeats. Higher variability generally indicates better cardiovascular health and stress resilience." },
  { term: "SQI", expansion: "Signal Quality Index", definition: "A score measuring how clean and reliable a recorded signal is — helping decide whether to trust the data or discard noisy segments." },
  { term: "QRS", expansion: "QRS Complex", definition: "The largest spike in an ECG waveform, representing the electrical impulse that triggers the main pumping chambers of the heart to contract." },
  { term: "PSD", expansion: "Power Spectral Density", definition: "A measure of how a signal's power is distributed across different frequencies — like showing which notes are loudest in a piece of music." },
  { term: "SNR", expansion: "Signal-to-Noise Ratio", definition: "A measure of how much useful signal there is compared to background noise. Higher SNR means cleaner data." },
  { term: "IMU", expansion: "Inertial Measurement Unit", definition: "A sensor package that measures acceleration and rotation, found in phones and drones. Combines accelerometers and gyroscopes." },

  // ── Biology & chemistry ──
  { term: "SMILES", expansion: "Simplified Molecular-Input Line-Entry System", definition: "A way to represent chemical structures as text strings — like a language for describing molecules. For example, 'O' means water (H2O)." },
  { term: "ECFP", expansion: "Extended-Connectivity Fingerprint", definition: "A way to encode a molecule's structure as a fixed-length binary vector by looking at the local chemical neighborhood around each atom." },
  { term: "PDB", expansion: "Protein Data Bank", definition: "A public database of 3D structures of proteins and other biological molecules, determined by experiments like X-ray crystallography." },
  { term: "MRI", expansion: "Magnetic Resonance Imaging", definition: "A medical imaging technique that uses magnetic fields and radio waves to create detailed pictures of organs and tissues inside the body." },
  { term: "CT", expansion: "Computed Tomography", definition: "A medical imaging technique that combines many X-ray images taken from different angles to create cross-sectional 'slices' of the body." },
  { term: "RNA", expansion: "Ribonucleic Acid", definition: "A molecule similar to DNA that carries genetic instructions from DNA to the cell's protein-making machinery. mRNA vaccines work by providing RNA instructions." },
  { term: "DICOM", expansion: "Digital Imaging and Communications in Medicine", definition: "The standard file format for medical images (CT scans, MRIs, X-rays), including both the image data and patient/study metadata." },
  { term: "MIL", expansion: "Multiple Instance Learning", definition: "A learning approach where training examples come in 'bags' — you know the label for the whole bag but not individual items. Used when only slide-level (not cell-level) labels are available." },

  // ── Infrastructure & compute ──
  { term: "GPU", expansion: "Graphics Processing Unit", definition: "A processor originally designed for rendering graphics but now widely used for ML because it can perform thousands of simple calculations simultaneously." },
  { term: "TPU", expansion: "Tensor Processing Unit", definition: "Google's custom chip designed specifically for neural network computations, optimized for the matrix multiplications that dominate deep learning." },
  { term: "CPU", expansion: "Central Processing Unit", definition: "The main general-purpose processor in a computer. Good at complex sequential tasks but slower than GPUs for the massively parallel math used in ML." },
  { term: "API", expansion: "Application Programming Interface", definition: "A set of rules that lets different software programs talk to each other — like a waiter taking orders between you (the program) and the kitchen (the service)." },
  { term: "ONNX", expansion: "Open Neural Network Exchange", definition: "A standard file format for representing ML models, allowing models trained in one framework (like PyTorch) to run in another (like TensorFlow)." },
  { term: "JIT", expansion: "Just-In-Time (compilation)", definition: "A technique where code is compiled right before it runs rather than ahead of time, allowing the compiler to optimize for the specific hardware and data it encounters." },

  // ── Sciona-specific ──
  { term: "CDG", expansion: "Conceptual Directed Graph", definition: "Sciona's representation of an algorithmic pipeline as a graph of stages connected by data flows. Each stage has a concept type and can be bound to a concrete atom implementation." },
  { term: "FQDN", expansion: "Fully Qualified Domain Name (in Sciona context: Fully Qualified Atom Name)", definition: "The complete dotted path that uniquely identifies an atom in the Sciona catalog, like 'sciona.atoms.dl.adversarial.ensemble_prediction_label_inference'." },

  // ── Statistics & math ──
  { term: "ICA", expansion: "Independent Component Analysis", definition: "A technique for separating a mixed signal into independent source signals — like isolating individual voices from a recording of many people talking at once." },
  { term: "HSIC", expansion: "Hilbert-Schmidt Independence Criterion", definition: "A statistical test that measures the dependence between two variables using kernel functions, capable of detecting nonlinear relationships that correlation misses." },
  { term: "OOF", expansion: "Out-of-Fold", definition: "Predictions made on data that wasn't used to train the model in that particular cross-validation fold, giving an honest estimate of generalization performance." },
  { term: "CV", expansion: "Cross-Validation", definition: "A technique for evaluating model performance by splitting data into K parts, training on K-1 parts, and testing on the remaining part, then rotating. Gives a more reliable performance estimate than a single train/test split." },
  { term: "SPD", expansion: "Symmetric Positive Definite (matrix)", definition: "A special type of matrix that has only positive eigenvalues and equals its own transpose. Covariance matrices are always SPD, and this property is used in many geometric algorithms." },
  { term: "L1", expansion: "L1 Norm / L1 Regularization", definition: "The sum of absolute values. L1 regularization adds this sum of absolute weights as a penalty, encouraging the model to use fewer features (some weights become exactly zero)." },
  { term: "L2", expansion: "L2 Norm / L2 Regularization", definition: "The square root of the sum of squared values (Euclidean distance). L2 regularization penalizes large weights, encouraging them to be small but not necessarily zero." },

  // ── Computer vision ──
  { term: "RGB", expansion: "Red, Green, Blue", definition: "The standard color model for digital images, where each pixel is described by three numbers representing the intensity of red, green, and blue light." },
  { term: "HSV", expansion: "Hue, Saturation, Value", definition: "A color model that describes colors the way humans think about them — hue is the color type, saturation is how vivid it is, and value is how bright it is." },
  { term: "ROI", expansion: "Region of Interest", definition: "A specific area in an image that you want to focus on or analyze, like cropping around a face in a photo for facial recognition." },
  { term: "OCR", expansion: "Optical Character Recognition", definition: "Technology that converts images of text (like photos of documents or street signs) into machine-readable text that a computer can search and edit." },
  { term: "BEV", expansion: "Bird's-Eye View", definition: "A top-down perspective of a scene, as if looking straight down from above. Used in autonomous driving to understand the layout of roads, vehicles, and obstacles." },

  // ── Retrieval & search ──
  { term: "RAG", expansion: "Retrieval-Augmented Generation", definition: "A technique that combines a search engine with a language model — first retrieve relevant documents, then generate an answer based on both the question and the retrieved context." },
  { term: "BM25", expansion: "Best Matching 25", definition: "A text search algorithm that ranks documents by relevance using word frequency and document length. The standard baseline for information retrieval." },
  { term: "FAISS", expansion: "Facebook AI Similarity Search", definition: "A library for efficiently searching through millions of high-dimensional vectors to find the most similar ones, used for nearest-neighbor search in embeddings." },

  // ── Physics & astronomy ──
  { term: "UTC", expansion: "Coordinated Universal Time", definition: "The primary time standard used worldwide. It's essentially the same as Greenwich Mean Time (GMT) and is the reference for all other time zones." },
  { term: "TAI", expansion: "International Atomic Time (French: Temps Atomique International)", definition: "An ultra-precise time standard based on atomic clocks. Unlike UTC, TAI doesn't have leap seconds, so it gradually drifts ahead of UTC." },
  { term: "GNSS", expansion: "Global Navigation Satellite System", definition: "The general term for satellite navigation systems like GPS (US), Galileo (EU), GLONASS (Russia), and BeiDou (China) that provide positioning data." },
  { term: "VIO", expansion: "Visual-Inertial Odometry", definition: "A technique for tracking position and orientation by combining camera images with IMU sensor data — used in AR headsets and drones." },
];

/**
 * Find all glossary entries whose terms appear in the given text.
 * Scans for whole-word matches (case-sensitive for acronyms).
 */
export function findRelevantTerms(text: string): GlossaryEntry[] {
  const found = new Map<string, GlossaryEntry>();
  for (const entry of glossary) {
    const terms = [entry.term, ...(entry.aliases ?? [])];
    for (const t of terms) {
      // Match whole word, case-sensitive for uppercase acronyms
      const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(text)) {
        found.set(entry.term, entry);
        break;
      }
    }
  }
  // Sort alphabetically by term
  return [...found.values()].sort((a, b) => a.term.localeCompare(b.term));
}
