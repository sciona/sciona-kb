/**
 * Educational descriptions for each concept_type, written for a
 * high-school audience. Used on /concept/[type] pages and linked
 * from the viewer detail panel badges.
 */

export interface ConceptDescription {
  title: string;
  emoji: string;
  oneLiner: string;
  explanation: string;
  realWorldAnalogy: string;
  whyItMatters: string;
  exampleUses: string[];
}

export const conceptDescriptions: Record<string, ConceptDescription> = {
  data_assembly: {
    title: "Data Assembly",
    emoji: "🧱",
    oneLiner: "Collecting and organizing raw ingredients before cooking.",
    explanation:
      "Data assembly is the first step in almost every algorithm. Before you can analyze anything, you need to gather your raw data and reshape it into a format the rest of the pipeline can use. This might mean loading files, converting units, joining tables together, or filling in missing values. Think of it as mise en place in cooking -- getting all your ingredients measured and ready before you turn on the stove.",
    realWorldAnalogy:
      "Imagine you're building a Lego set. Before you start snapping bricks together, you dump out all the bags, sort pieces by color and size, and lay out the instruction manual. That sorting step is data assembly.",
    whyItMatters:
      "If your data is messy, incomplete, or in the wrong shape, every downstream step will produce garbage results. A well-designed data assembly stage means the rest of your algorithm can trust its inputs.",
    exampleUses: [
      "Loading medical images and converting pixel values to standard ranges",
      "Joining a customer's purchase history with their demographic profile",
      "Parsing raw sensor readings into time-aligned feature vectors",
    ],
  },

  neural_network: {
    title: "Neural Network",
    emoji: "🧠",
    oneLiner: "A pattern-recognition machine inspired by how brain cells connect.",
    explanation:
      "A neural network is a stack of simple mathematical functions (called layers) that transform input data step by step until the output represents something useful -- like a classification, a prediction, or a generated image. Each layer has adjustable numbers (weights) that the network learns by looking at thousands of examples. The \"learning\" process nudges those weights so the network's mistakes get smaller over time.",
    realWorldAnalogy:
      "Think of a factory assembly line where each station adds or changes something small. Raw metal goes in one end; a finished phone comes out the other. Each station (layer) only does one simple operation, but chaining many together produces something complex. Training is like calibrating every station until the phones pass quality control.",
    whyItMatters:
      "Neural networks can discover patterns too subtle or complex for a human to write rules for. They power image recognition, language translation, speech synthesis, game-playing AI, and much more.",
    exampleUses: [
      "Classifying whether a skin lesion in a photo is cancerous",
      "Translating a sentence from English to Japanese",
      "Predicting the 3D shape of a protein from its amino acid sequence",
    ],
  },

  data_extraction: {
    title: "Data Extraction",
    emoji: "⛏️",
    oneLiner: "Pulling out the specific pieces of information you actually need.",
    explanation:
      "Data extraction is about reaching into a large, complex dataset and pulling out just the features, columns, or signals that matter for the task. This could mean selecting relevant columns from a spreadsheet, computing a statistic from a time series, or running a feature-detection algorithm on an image. The goal is to reduce the data to its most informative parts so later stages don't drown in noise.",
    realWorldAnalogy:
      "You're reading a 300-page textbook to prepare for an exam, but you only need facts from chapters 4, 7, and 12. Highlighting those key passages and writing them on flashcards is data extraction.",
    whyItMatters:
      "Algorithms work faster and more accurately when they focus on the right signals. Extracting good features is often the difference between a model that barely works and one that wins competitions.",
    exampleUses: [
      "Computing the rolling average and standard deviation from stock prices",
      "Extracting text tokens from a PDF document",
      "Detecting edges and corners in a satellite image",
    ],
  },

  analysis: {
    title: "Analysis",
    emoji: "🔬",
    oneLiner: "Examining results to draw conclusions or check quality.",
    explanation:
      "Analysis stages take processed data or model outputs and evaluate them -- computing scores, running statistical tests, comparing predictions to ground truth, or deciding which of several options is best. This is the \"thinking\" part of an algorithm where raw numbers get turned into decisions or insights.",
    realWorldAnalogy:
      "After running a science experiment, you look at your data, calculate averages, plot graphs, and decide whether your hypothesis was supported. That evaluation step is analysis.",
    whyItMatters:
      "Without analysis, you have numbers but no meaning. This stage transforms outputs into actionable conclusions and catches problems before they propagate.",
    exampleUses: [
      "Computing the accuracy, precision, and recall of a classifier",
      "Running a statistical test to check if two distributions differ",
      "Comparing multiple model predictions to select the best one",
    ],
  },

  optimization: {
    title: "Optimization",
    emoji: "📈",
    oneLiner: "Finding the best possible answer by systematically improving a guess.",
    explanation:
      "Optimization is the process of adjusting parameters to make some objective function as good as possible -- either minimizing something bad (like errors) or maximizing something good (like profit). Most machine learning training is optimization: you start with random guesses for your model's weights, measure how wrong they are, then nudge them in a direction that reduces the error. Repeat thousands of times.",
    realWorldAnalogy:
      "Imagine tuning a radio dial to find the clearest signal. You turn the knob a little, listen, turn more if it's getting better, and reverse if it gets worse. Eventually you land on the sweet spot. Optimization algorithms do this with millions of \"dials\" simultaneously.",
    whyItMatters:
      "Nearly every learning algorithm boils down to optimization. The quality of the optimizer determines how fast a model trains and how good the final result is.",
    exampleUses: [
      "Training a neural network by minimizing prediction error with gradient descent",
      "Finding the shortest delivery route for a fleet of trucks",
      "Tuning hyperparameters to maximize model accuracy on validation data",
    ],
  },

  dimensionality_reduction: {
    title: "Dimensionality Reduction",
    emoji: "🗜️",
    oneLiner: "Compressing data into fewer numbers while keeping what matters.",
    explanation:
      "Real-world data often has hundreds or thousands of features (dimensions), but much of that information is redundant. Dimensionality reduction finds a smaller set of numbers that captures the essential patterns. Techniques like PCA find the directions of greatest variation; autoencoders learn a compressed representation through a neural network bottleneck.",
    realWorldAnalogy:
      "Imagine describing a person. You could list 500 measurements (left pinky length, right eyebrow angle...) or just say \"tall, brown hair, glasses.\" The short description loses some detail but captures what matters. That's dimensionality reduction.",
    whyItMatters:
      "Fewer dimensions means faster computation, less overfitting, and easier visualization. Many algorithms struggle with very high-dimensional data (the \"curse of dimensionality\"), so reducing dimensions is often essential.",
    exampleUses: [
      "Using PCA to reduce 768-dimensional word embeddings to 50 dimensions",
      "Projecting high-dimensional gene expression data to 2D for visualization",
      "Compressing image features before feeding them to a classifier",
    ],
  },

  loss_function: {
    title: "Loss Function",
    emoji: "🎯",
    oneLiner: "A scoreboard that tells the algorithm how wrong it is.",
    explanation:
      "A loss function takes the algorithm's prediction and the correct answer, then outputs a single number measuring how far off the prediction was. A perfect prediction gives a loss of zero; terrible predictions give large losses. The optimization stage uses this score to figure out which direction to adjust the model's parameters. Different tasks need different loss functions -- classifying images uses cross-entropy loss, predicting prices uses mean squared error, and so on.",
    realWorldAnalogy:
      "Think of an archery target. The loss function is the distance from where your arrow lands to the bullseye. The closer you are, the lower your \"loss.\" Your coach (the optimizer) uses that distance to tell you how to adjust your aim next time.",
    whyItMatters:
      "The choice of loss function defines what \"good\" means for your algorithm. Pick the wrong one and the model will optimize for the wrong thing, even if everything else is perfect.",
    exampleUses: [
      "Cross-entropy loss for image classification (penalizes confident wrong answers)",
      "Pinball loss for quantile regression (asymmetric penalty for over/under prediction)",
      "Dice loss for medical image segmentation (directly optimizes overlap with ground truth)",
    ],
  },

  graph_traversal: {
    title: "Graph Traversal",
    emoji: "🕸️",
    oneLiner: "Walking through a network of connected things, node by node.",
    explanation:
      "A graph is a collection of nodes (things) connected by edges (relationships). Graph traversal means visiting nodes in a systematic order -- breadth-first (all neighbors first, then their neighbors) or depth-first (follow one path as far as it goes, then backtrack). This is the foundation for finding shortest paths, detecting connected components, and propagating information through networks.",
    realWorldAnalogy:
      "Imagine exploring a maze. You can either check every path one step at a time (breadth-first, like a wave expanding outward) or follow each corridor to its end before backtracking (depth-first). Both visit every room eventually, just in different orders.",
    whyItMatters:
      "Many real problems are naturally graphs -- social networks, road maps, molecule structures, circuit boards. Traversal algorithms are the basic tool for extracting information from these structures.",
    exampleUses: [
      "Finding connected components in a brain connectome",
      "Building a neighborhood graph for nearest-neighbor search",
      "Propagating labels through a citation network",
    ],
  },

  signal_transform: {
    title: "Signal Transform",
    emoji: "🌊",
    oneLiner: "Converting a signal into a different representation that reveals hidden patterns.",
    explanation:
      "Signals -- audio waveforms, time series, images -- contain information that's easier to see in certain representations. A signal transform converts data from one domain to another. The Fourier transform converts a time-domain signal into its frequency components; a wavelet transform captures both frequency and timing; a spectrogram shows how frequencies change over time. The raw data hasn't changed, but the transform makes certain patterns obvious.",
    realWorldAnalogy:
      "Imagine looking at a painting from one inch away -- you see brushstrokes and color blobs. Step back ten feet and you see the whole picture. Signal transforms are like changing your viewing distance: the same information, viewed in a way that reveals different structure.",
    whyItMatters:
      "Many patterns (like the pitch of a musical note or the periodicity of a heartbeat) are invisible in the raw signal but jump out after the right transform. Choosing the right representation is often the key insight in signal-processing pipelines.",
    exampleUses: [
      "Converting audio to a mel spectrogram for bird call classification",
      "Applying a Fourier transform to detect periodic patterns in stock prices",
      "Using a discrete cosine transform for image compression",
    ],
  },

  signal_filter: {
    title: "Signal Filter",
    emoji: "🔇",
    oneLiner: "Removing noise or unwanted parts from a signal while keeping the good stuff.",
    explanation:
      "Filtering takes a noisy or cluttered signal and cleans it up by removing unwanted components. A low-pass filter keeps slow changes and removes fast jitter (noise); a high-pass filter does the opposite. More sophisticated filters like Kalman filters combine measurements with a physics model to estimate the true state of a system. The key idea: not all variation in data is meaningful, and filtering separates signal from noise.",
    realWorldAnalogy:
      "Think of noise-canceling headphones. They don't change the music -- they remove the airplane rumble so you can hear what matters. A signal filter does the same thing mathematically.",
    whyItMatters:
      "Real-world data is always noisy. Filtering improves the signal-to-noise ratio so downstream stages (like classifiers or detectors) can work with cleaner inputs and make fewer mistakes.",
    exampleUses: [
      "Applying a low-pass filter to remove electrical noise from EEG brain signals",
      "Using wavelet denoising to clean up seismic recordings",
      "Running a CRF (conditional random field) to smooth segmentation predictions",
    ],
  },

  searching: {
    title: "Searching",
    emoji: "🔍",
    oneLiner: "Systematically looking through a space of possibilities to find the best match.",
    explanation:
      "Searching algorithms explore a collection of items or a space of possible solutions to find the one(s) that match a query or satisfy constraints. This ranges from simple lookups (binary search in a sorted list) to complex tree searches (exploring game moves in chess) and approximate nearest-neighbor search in high-dimensional vector spaces.",
    realWorldAnalogy:
      "Looking for a book in a library. If the shelves are sorted alphabetically, you can jump to roughly the right spot (binary search). If they're not sorted, you might scan shelf by shelf (linear search). For a huge library, you'd use the catalog system (index-based search).",
    whyItMatters:
      "Finding the right item quickly is fundamental to everything from web search engines to recommendation systems to game-playing AI. The difference between naive and clever search can be the difference between seconds and centuries of computation.",
    exampleUses: [
      "Nearest-neighbor search to find similar images in a database",
      "Beam search to decode the most likely sequence from a language model",
      "Alpha-beta pruning to search game trees in chess",
    ],
  },

  sampler: {
    title: "Sampler",
    emoji: "🎲",
    oneLiner: "Drawing random examples from a distribution to estimate or augment.",
    explanation:
      "Samplers generate random draws from probability distributions. This is used for data augmentation (creating training examples by randomly transforming existing ones), Monte Carlo estimation (approximating a hard integral by averaging random samples), and generative modeling (creating new images or text by sampling from a learned distribution).",
    realWorldAnalogy:
      "Imagine an opinion poll. Instead of asking every person in the country (impossible), you randomly sample 1,000 people and use their answers to estimate the whole population's views. Samplers do this for mathematical distributions.",
    whyItMatters:
      "Sampling turns intractable problems into approachable ones. It's how we train models on limited data (augmentation), estimate complex probabilities (Monte Carlo), and generate creative outputs (diffusion models, language models).",
    exampleUses: [
      "Random cropping and flipping of images during training",
      "MCMC sampling to estimate posterior distributions in Bayesian models",
      "Test-time augmentation: predicting on multiple random transforms and averaging",
    ],
  },

  geometry: {
    title: "Geometry",
    emoji: "📐",
    oneLiner: "Computing shapes, distances, and spatial relationships.",
    explanation:
      "Geometry stages perform spatial computations -- calculating distances between points, fitting circles or lines to data, transforming coordinate systems, computing intersections, and measuring angles. These operations are fundamental when algorithms work with physical space: particle tracks, robot paths, 3D reconstructions, or map coordinates.",
    realWorldAnalogy:
      "Using a ruler, protractor, and compass in math class to construct shapes, measure angles, and find where lines intersect. Computational geometry does the same thing with equations instead of physical tools.",
    whyItMatters:
      "Any algorithm dealing with the physical world -- autonomous vehicles, medical imaging, satellite analysis, particle physics -- relies heavily on geometric computations to interpret spatial data correctly.",
    exampleUses: [
      "Fitting a helix to particle detector hits to reconstruct a particle's trajectory",
      "Computing the intersection of a 3D ray with a mesh for rendering",
      "Transforming GPS coordinates between reference frames",
    ],
  },

  conditional_routing: {
    title: "Conditional Routing",
    emoji: "🔀",
    oneLiner: "Choosing which path to take based on the data.",
    explanation:
      "Conditional routing is an if/else decision inside an algorithm pipeline. Based on some condition (a threshold, a classification result, a data property), the algorithm sends data down one path or another. This lets a single pipeline handle multiple scenarios -- like using different strategies for easy vs. hard inputs, or branching between targeted and non-targeted modes.",
    realWorldAnalogy:
      "A sorting machine at a post office that reads the zip code on each package and sends it down a different conveyor belt depending on where it needs to go. The machine doesn't change the packages -- it just routes them.",
    whyItMatters:
      "Real problems rarely have one-size-fits-all solutions. Conditional routing lets algorithms adapt their strategy to the specific input, which often dramatically improves performance compared to a single fixed pipeline.",
    exampleUses: [
      "Using a lightweight model for easy images and a heavy model for ambiguous ones",
      "Switching between attack strategies based on the perturbation budget",
      "Routing text to different processing pipelines based on detected language",
    ],
  },

  fixed_point: {
    title: "Fixed Point Iteration",
    emoji: "🔄",
    oneLiner: "Repeating a calculation until the answer stops changing.",
    explanation:
      "A fixed-point iteration applies the same operation over and over, feeding each output back as the next input, until the result converges (stops changing significantly). Many algorithms are fundamentally iterative: gradient descent updates weights repeatedly, the Expectation-Maximization algorithm alternates between two steps, and power iteration finds dominant eigenvectors by repeated matrix-vector multiplication.",
    realWorldAnalogy:
      "Imagine focusing a camera by turning the lens ring. Each turn makes the image a bit sharper. You keep adjusting until the picture doesn't get any clearer -- that's convergence. The \"fixed point\" is the focus setting where further turns don't help.",
    whyItMatters:
      "Many problems don't have clean closed-form solutions. Iterative methods let us sneak up on the answer through successive refinement, which is often the only practical approach for complex systems.",
    exampleUses: [
      "Gradient descent iterating to minimize a loss function",
      "MI-FGSM accumulating momentum-smoothed gradients over multiple attack iterations",
      "PageRank iterating until webpage importance scores stabilize",
    ],
  },

  information_theory: {
    title: "Information Theory",
    emoji: "📡",
    oneLiner: "Measuring how much surprise, randomness, or structure is in data.",
    explanation:
      "Information theory gives us precise ways to measure uncertainty (entropy), the information gained by observing something (mutual information), and the difference between probability distributions (divergence). These measures help algorithms decide which features are informative, detect when distributions shift, and quantify the complexity of a dataset.",
    realWorldAnalogy:
      "Think about a weather forecast. If it says \"sunny\" in the Sahara Desert, that's not very informative -- you already expected sun. But \"snow in the Sahara\" is extremely informative because it's surprising. Entropy measures this: low entropy means predictable, high entropy means surprising.",
    whyItMatters:
      "Information-theoretic measures are the foundation of feature selection, decision trees, compression algorithms, and many statistical tests. They provide a principled way to quantify \"how much does this data tell me?\"",
    exampleUses: [
      "Using mutual information to select the most predictive features",
      "Measuring the KL divergence between a model's predictions and the true distribution",
      "Computing entropy to detect anomalous or out-of-distribution inputs",
    ],
  },

  clustering: {
    title: "Clustering",
    emoji: "🫧",
    oneLiner: "Grouping similar things together without being told the groups in advance.",
    explanation:
      "Clustering algorithms discover natural groupings in data. Unlike classification (where you're told the categories), clustering finds structure on its own. K-means partitions data into k groups by minimizing within-group distances; DBSCAN finds dense regions separated by sparse areas; hierarchical clustering builds a tree of nested groups.",
    realWorldAnalogy:
      "Imagine dumping a bag of mixed candies on a table and sorting them by color without anyone telling you what colors exist. You'd naturally create piles of red, blue, green candies. Clustering algorithms do this with data points in high-dimensional space.",
    whyItMatters:
      "Clustering reveals hidden structure in unlabeled data. It's used for customer segmentation, anomaly detection, image segmentation, gene expression analysis, and any task where you need to find natural groupings.",
    exampleUses: [
      "Segmenting customers into behavioral groups for targeted marketing",
      "Grouping similar news articles to detect trending topics",
      "Identifying cell types from single-cell gene expression data",
    ],
  },

  randomized: {
    title: "Randomized Algorithm",
    emoji: "🎰",
    oneLiner: "Using randomness on purpose to solve problems faster or break symmetry.",
    explanation:
      "Randomized algorithms intentionally inject randomness to gain speed, simplicity, or robustness. Random initialization avoids bias; random sampling approximates expensive exact computations; random perturbation helps escape local optima. The results may vary between runs, but on average they're very good -- often provably close to optimal.",
    realWorldAnalogy:
      "Shuffling a deck of cards before dealing ensures fairness even though the process is random. Randomized algorithms similarly use controlled randomness to achieve reliable results without exhaustive computation.",
    whyItMatters:
      "Many exact algorithms are too slow for real-world data sizes. Randomized approaches trade a tiny amount of precision for massive speed gains, making previously intractable problems solvable.",
    exampleUses: [
      "Random forest: training many decision trees on random data subsets",
      "Randomized SVD for fast low-rank matrix approximation",
      "Stochastic gradient descent using random mini-batches",
    ],
  },

  posterior_update: {
    title: "Posterior Update",
    emoji: "🧮",
    oneLiner: "Updating your beliefs based on new evidence, using Bayes' rule.",
    explanation:
      "In Bayesian statistics, you start with a prior belief (what you think before seeing data) and update it using new evidence to get a posterior belief (what you think after seeing data). Posterior update stages apply Bayes' theorem or its approximations to revise probability distributions as new data arrives. This is the mathematical backbone of reasoning under uncertainty.",
    realWorldAnalogy:
      "A doctor's diagnosis process: before tests, they have a prior guess based on symptoms. Each test result updates their belief. After several tests, their posterior probability of each disease is much more accurate than the initial guess.",
    whyItMatters:
      "Posterior updates let algorithms quantify uncertainty and improve incrementally as more data arrives. This is essential for decision-making under uncertainty, sensor fusion, and online learning.",
    exampleUses: [
      "Kalman filter updating state estimates as new sensor readings arrive",
      "Bayesian optimization updating the surrogate model after each experiment",
      "Spam filter updating word probabilities as new emails are classified",
    ],
  },

  ml_model_selection: {
    title: "Model Selection",
    emoji: "🏆",
    oneLiner: "Choosing the best model or hyperparameters from a set of candidates.",
    explanation:
      "Model selection stages compare multiple trained models or hyperparameter configurations and pick the best one. This involves cross-validation (testing on held-out data folds), scoring metrics (accuracy, AUC, RMSE), and selection criteria that balance performance with complexity to avoid overfitting.",
    realWorldAnalogy:
      "Auditioning musicians for an orchestra. You listen to each candidate play the same piece, score their performance, and select the best fit. Model selection evaluates algorithms the same way -- on standardized test data with consistent scoring.",
    whyItMatters:
      "No single model is best for every problem. Systematic model selection ensures you pick the approach that actually performs best on your specific data, rather than relying on intuition or defaults.",
    exampleUses: [
      "Grid search over learning rates to find the optimal training speed",
      "Comparing random forest, XGBoost, and neural network on the same validation split",
      "Using Bayesian optimization to efficiently search a large hyperparameter space",
    ],
  },

  sequential_filter: {
    title: "Sequential Filter",
    emoji: "⏩",
    oneLiner: "Processing data one step at a time, where each step depends on the previous.",
    explanation:
      "Sequential filters process data in order, maintaining a running state that gets updated with each new observation. Unlike batch operations that see all data at once, sequential filters handle streaming data naturally. The Kalman filter, exponential moving averages, and recurrent neural networks are all sequential filters.",
    realWorldAnalogy:
      "Reading a mystery novel chapter by chapter. Your understanding (state) after chapter 5 depends on everything you've read so far. You can't skip to chapter 10 without missing context. Sequential filters process data the same way -- one step at a time, building on prior state.",
    whyItMatters:
      "Much real-world data arrives in sequence: sensor streams, financial ticks, user actions. Sequential filters can process this data in real-time without waiting to see the whole dataset.",
    exampleUses: [
      "Tracking an object's position using a Kalman filter on noisy GPS readings",
      "Smoothing a stock price with an exponential moving average",
      "Processing audio frames sequentially for real-time speech recognition",
    ],
  },

  external_tool: {
    title: "External Tool",
    emoji: "🔧",
    oneLiner: "Calling out to a specialized tool or API that does something the algorithm can't do itself.",
    explanation:
      "External tool stages represent calls to pre-built systems that the algorithm uses as a black box -- a pretrained model checkpoint, a third-party API, a database lookup, or a domain-specific solver. The algorithm doesn't implement this logic itself; it delegates to a specialized tool and uses the result.",
    realWorldAnalogy:
      "A chef using a food processor. They don't build the motor or design the blades -- they just put ingredients in and get chopped results out. The food processor is an external tool in the cooking pipeline.",
    whyItMatters:
      "Not everything needs to be built from scratch. Using battle-tested external tools (pretrained models, optimized solvers) saves development time and often produces better results than reimplementing from scratch.",
    exampleUses: [
      "Loading a pretrained ImageNet model as a feature extractor",
      "Calling a geocoding API to convert addresses to coordinates",
      "Using an off-the-shelf OCR engine to extract text from images",
    ],
  },

  external_knowledge: {
    title: "External Knowledge",
    emoji: "📚",
    oneLiner: "Bringing in domain expertise or reference data from outside the algorithm.",
    explanation:
      "External knowledge stages inject information that can't be learned from the training data alone -- lookup tables, physics equations, expert-curated rules, or reference databases. This gives the algorithm access to established facts and domain constraints that would be impossible or inefficient to rediscover from data.",
    realWorldAnalogy:
      "An open-book exam. Instead of memorizing everything, you bring a formula sheet with key equations. The external knowledge lets you solve problems you couldn't from memory alone.",
    whyItMatters:
      "Pure data-driven learning has limits. Incorporating domain knowledge (physical laws, biological constraints, engineering rules) makes algorithms more accurate, more data-efficient, and more trustworthy.",
    exampleUses: [
      "Using a periodic table of elements as a lookup for molecular property prediction",
      "Injecting conservation-of-energy constraints into a physics simulation",
      "Referencing a medical coding dictionary to validate diagnosis predictions",
    ],
  },

  greedy: {
    title: "Greedy Algorithm",
    emoji: "🤑",
    oneLiner: "Always picking the best-looking option right now, without looking ahead.",
    explanation:
      "A greedy algorithm makes the locally optimal choice at each step, hoping this leads to a globally optimal solution. It never reconsiders past decisions. For some problems (like building a minimum spanning tree), greedy always finds the best answer. For others, it finds a good-but-not-perfect approximation very quickly.",
    realWorldAnalogy:
      "At a buffet, always reaching for the dish that looks most delicious right now. You might end up with a great meal, or you might fill your plate with appetizers and have no room for the main course. Greedy works perfectly when individual choices don't affect future options.",
    whyItMatters:
      "Greedy algorithms are simple, fast, and often \"good enough.\" When they provably find the optimal solution (as for some graph problems), they're the best tool available.",
    exampleUses: [
      "Huffman coding: always merging the two least-frequent symbols",
      "Activity selection: always picking the event that finishes earliest",
      "Non-maximum suppression in object detection: greedily keeping the highest-confidence box",
    ],
  },

  dynamic_programming: {
    title: "Dynamic Programming",
    emoji: "📊",
    oneLiner: "Solving a big problem by remembering the answers to smaller sub-problems.",
    explanation:
      "Dynamic programming (DP) breaks a complex problem into overlapping sub-problems, solves each one once, and stores the results in a table so they never need to be recomputed. This converts exponential brute-force approaches into polynomial-time algorithms. The key insight: if the same sub-problem appears multiple times, compute it once and reuse.",
    realWorldAnalogy:
      "Computing Fibonacci numbers. To find F(10), you need F(9) and F(8). To find F(9), you need F(8) and F(7). Without DP, you'd recompute F(8) twice, F(7) three times, and so on exponentially. DP says: write each answer on a sticky note the first time, then just look it up.",
    whyItMatters:
      "DP transforms many seemingly impossible problems into fast ones. It's behind sequence alignment in bioinformatics, shortest paths in navigation, and parsing in compilers.",
    exampleUses: [
      "Sequence alignment (edit distance) for comparing DNA strands",
      "Viterbi algorithm for finding the most likely hidden state sequence",
      "Knapsack problem: maximizing value under a weight constraint",
    ],
  },

  graph_optimization: {
    title: "Graph Optimization",
    emoji: "🗺️",
    oneLiner: "Finding the best paths, flows, or assignments in a network.",
    explanation:
      "Graph optimization takes a network of nodes and edges and finds the optimal structure -- the shortest path, the maximum flow, the minimum spanning tree, or the best matching between two sets. These problems appear everywhere that relationships between entities need to be optimized.",
    realWorldAnalogy:
      "A delivery company planning the day's routes. They have a map of addresses (nodes) and roads (edges) and need to find the cheapest set of routes that visits every customer. That's a graph optimization problem.",
    whyItMatters:
      "Networks are everywhere -- supply chains, social networks, circuits, communication systems. Optimizing over these structures directly impacts efficiency, cost, and performance in countless applications.",
    exampleUses: [
      "Dijkstra's algorithm for GPS navigation (shortest path)",
      "Hungarian algorithm for assigning workers to tasks (minimum-cost matching)",
      "Finding the minimum spanning tree for network cable layout",
    ],
  },

  algebra: {
    title: "Algebra",
    emoji: "🔣",
    oneLiner: "Manipulating symbols and equations to isolate unknowns or simplify expressions.",
    explanation:
      "Algebraic stages rearrange, simplify, or solve symbolic or numerical expressions. This includes matrix operations (inversion, decomposition), polynomial manipulation, solving systems of linear equations, and computing closed-form expressions. Where numerical methods iterate toward an answer, algebra stages compute it directly from structure.",
    realWorldAnalogy:
      "Solving for x in a math equation. You move terms around, factor, divide both sides -- all following rules that preserve equality -- until x stands alone. Algebraic stages do this with matrices, tensors, and symbolic formulas.",
    whyItMatters:
      "Exact algebraic solutions are faster and more precise than iterative approximations when they exist. Matrix algebra in particular is the backbone of linear models, PCA, least-squares fitting, and graph Laplacians.",
    exampleUses: [
      "Inverting a covariance matrix for Gaussian likelihood computation",
      "Cholesky decomposition for efficient sampling from multivariate normals",
      "Solving a system of linear equations for optimal portfolio weights",
    ],
  },

  arithmetic: {
    title: "Arithmetic",
    emoji: "🧮",
    oneLiner: "Basic number-crunching: sums, products, ratios, and element-wise math.",
    explanation:
      "Arithmetic stages perform element-wise or aggregate numerical operations -- addition, multiplication, division, exponentiation, logs, clipping, rounding, and normalization. These are the low-level building blocks that every pipeline depends on. A single arithmetic atom might normalize features to zero mean, compute a ratio between two signals, or clamp values to a valid range.",
    realWorldAnalogy:
      "The basic operations on a calculator. Before you can do anything fancy, you need to add, multiply, and divide. Arithmetic atoms are the calculator keys that more complex stages press internally.",
    whyItMatters:
      "Numerical precision, overflow handling, and correct normalization often make or break a pipeline. Getting the arithmetic right -- especially with logs, exponentials, and floating-point edge cases -- prevents subtle bugs that are hard to diagnose downstream.",
    exampleUses: [
      "Normalizing pixel values from [0, 255] to [0, 1]",
      "Computing log-probabilities to avoid floating-point underflow",
      "Element-wise multiplication of attention weights with value vectors",
    ],
  },

  bio_structure_traversal: {
    title: "Biological Structure Traversal",
    emoji: "🧬",
    oneLiner: "Walking through molecular or biological structures to extract relationships.",
    explanation:
      "Biological structure traversal navigates domain-specific data structures in biology -- protein backbones, molecular graphs, phylogenetic trees, or genome sequences. These stages understand the conventions of biological data: residue numbering, chain identifiers, bond types, and secondary structure annotations. They extract spatial or sequential relationships that generic graph traversal would miss.",
    realWorldAnalogy:
      "A biologist tracing the backbone of a protein by following each amino acid in sequence, noting where the chain bends, which residues are close in 3D space, and where disulfide bonds connect distant parts. This requires knowing the biology, not just the graph structure.",
    whyItMatters:
      "Biology has rich, specialized structure. Generic algorithms miss domain-specific constraints (like the planarity of peptide bonds or the directionality of DNA). Specialized traversal respects these constraints and produces biologically meaningful results.",
    exampleUses: [
      "Walking a protein backbone to compute backbone dihedral angles",
      "Traversing a molecular graph to identify functional groups",
      "Tracing phylogenetic trees to compute evolutionary distances",
    ],
  },

  classification: {
    title: "Classification",
    emoji: "🏷️",
    oneLiner: "Assigning each input to one of a fixed set of categories.",
    explanation:
      "Classification takes an input (an image, a text, a feature vector) and assigns it a discrete label from a predefined set of categories. The classifier learns a decision boundary that separates the categories in feature space. This can be binary (spam vs. not-spam), multi-class (cat vs. dog vs. bird), or multi-label (an image can be both 'outdoor' and 'sunny').",
    realWorldAnalogy:
      "A mail sorter at the post office who looks at each letter and drops it into one of several bins based on destination. The sorter has to decide which single bin each letter belongs in, even when the handwriting is messy.",
    whyItMatters:
      "Classification is one of the most common tasks in machine learning. Spam detection, medical diagnosis, sentiment analysis, object recognition, and fraud detection are all classification problems. Getting the boundary right determines real-world accuracy.",
    exampleUses: [
      "Classifying emails as spam or ham based on word patterns",
      "Diagnosing skin lesions as benign or malignant from photos",
      "Predicting customer churn as yes/no from usage features",
    ],
  },

  combinatorics: {
    title: "Combinatorics",
    emoji: "🔢",
    oneLiner: "Counting, enumerating, or selecting structured arrangements from a finite set.",
    explanation:
      "Combinatorial stages deal with discrete structures: permutations, combinations, subsets, partitions, and assignments. They enumerate possibilities, count valid configurations, or find optimal arrangements among a finite (but often astronomically large) set of options. This includes tasks like finding all subsets of features, generating permutations for augmentation, or solving assignment problems.",
    realWorldAnalogy:
      "Figuring out how many different outfits you can make from your wardrobe. With 5 shirts, 3 pants, and 2 shoes, there are 5x3x2 = 30 combinations. Combinatorics counts and navigates these possibilities systematically.",
    whyItMatters:
      "Many optimization and search problems are fundamentally combinatorial. The challenge is that the number of possibilities explodes exponentially, so clever enumeration or pruning strategies are essential.",
    exampleUses: [
      "Enumerating all feature subsets for exhaustive feature selection",
      "Generating permutations for data augmentation in ranking problems",
      "Computing binomial coefficients for statistical hypothesis tests",
    ],
  },

  custom: {
    title: "Custom Logic",
    emoji: "⚙️",
    oneLiner: "Problem-specific operations that don't fit neatly into standard categories.",
    explanation:
      "Custom stages contain domain-specific or problem-specific logic that's tailored to a particular pipeline. They might encode competition-specific preprocessing rules, unusual data format conversions, or domain heuristics that wouldn't generalize to other problems. These stages exist because real-world problems often have unique quirks that standard building blocks don't cover.",
    realWorldAnalogy:
      "A custom jig in a workshop -- a one-off tool built specifically to hold a particular piece at the right angle for cutting. It's not a standard tool, but it makes one specific job much easier.",
    whyItMatters:
      "Not every operation fits a textbook category. Custom stages let pipelines handle the messy, problem-specific details that often determine whether a solution actually works in practice.",
    exampleUses: [
      "Competition-specific post-processing rules to format submission files",
      "Domain-specific data cleaning for sensor artifacts unique to one instrument",
      "Hand-tuned heuristic thresholds for edge cases in production systems",
    ],
  },

  divide_and_conquer: {
    title: "Divide and Conquer",
    emoji: "✂️",
    oneLiner: "Breaking a big problem into smaller pieces, solving each, then combining results.",
    explanation:
      "Divide-and-conquer algorithms split the input into smaller sub-problems (divide), solve each sub-problem recursively or independently (conquer), and merge the partial results into a complete solution (combine). Unlike dynamic programming, the sub-problems typically don't overlap. This pattern naturally maps to parallel execution since independent sub-problems can run simultaneously.",
    realWorldAnalogy:
      "Organizing a messy room by splitting it into quadrants. You clean one quadrant at a time, then the whole room is clean. If you have friends, each person takes a quadrant simultaneously -- that's the parallel advantage of divide-and-conquer.",
    whyItMatters:
      "Divide-and-conquer turns impossible-seeming problems into manageable ones and often enables parallelism. Merge sort, quicksort, FFT, and many spatial algorithms use this pattern.",
    exampleUses: [
      "Merge sort: splitting an array in half, sorting each half, merging",
      "FFT: decomposing a Fourier transform into smaller transforms",
      "Spatial indexing: recursively partitioning space into quadtrees or k-d trees",
    ],
  },

  likelihood_evaluation: {
    title: "Likelihood Evaluation",
    emoji: "📏",
    oneLiner: "Computing how probable the observed data is under a given model.",
    explanation:
      "Likelihood evaluation calculates the probability (or probability density) of the observed data given a specific set of model parameters. This is the core computation in maximum likelihood estimation, Bayesian inference, and model comparison. A higher likelihood means the model explains the data better. In practice, log-likelihoods are used to avoid numerical underflow when multiplying many small probabilities.",
    realWorldAnalogy:
      "A detective evaluating a suspect's alibi. Given the evidence (data), how plausible is this particular story (model)? A story that perfectly explains all the evidence has high likelihood; one that contradicts the evidence has low likelihood.",
    whyItMatters:
      "Likelihood is the bridge between data and models. It's how we fit statistical models to data, compare competing hypotheses, and quantify how well a model captures reality.",
    exampleUses: [
      "Computing the Gaussian log-likelihood for regression residuals",
      "Evaluating the likelihood of a Bayesian network given observed variables",
      "Computing marginal likelihood for Bayesian model comparison",
    ],
  },

  log_prob: {
    title: "Log-Probability",
    emoji: "📉",
    oneLiner: "Working in log-space to compute probabilities without numerical overflow.",
    explanation:
      "Log-probability stages compute and manipulate probabilities in logarithmic space. Since raw probabilities can be astronomically small (multiplying hundreds of numbers less than 1), working with their logarithms keeps values in a numerically stable range. Addition in log-space replaces multiplication in probability space, and the log-sum-exp trick handles addition. This is a numerical necessity for almost any probabilistic pipeline.",
    realWorldAnalogy:
      "Scientists use the Richter scale (logarithmic) instead of raw earthquake energy because the numbers would be unmanageably large. Log-probabilities use the same trick: working with exponents instead of the impossibly tiny numbers themselves.",
    whyItMatters:
      "Without log-space arithmetic, probabilistic models would constantly underflow to zero. Log-probs make Bayesian inference, language models, HMMs, and mixture models numerically tractable.",
    exampleUses: [
      "Computing log-likelihood of a sequence in a language model",
      "Log-sum-exp for numerically stable mixture model evaluation",
      "Adding log-probabilities instead of multiplying raw probabilities in HMMs",
    ],
  },

  marginal_computation: {
    title: "Marginal Computation",
    emoji: "∫",
    oneLiner: "Summing or integrating out variables to get the probability of what remains.",
    explanation:
      "Marginalization computes the probability of a subset of variables by summing (or integrating) over all possible values of the other variables. If you have a joint distribution over X and Y but only care about X, you marginalize out Y. This is fundamental to Bayesian inference, where you often need to integrate over nuisance parameters to get the quantity you actually care about.",
    realWorldAnalogy:
      "You want to know the probability it will rain tomorrow, but your weather model predicts rain conditioned on temperature, humidity, and wind. To get just the rain probability, you average over all possible temperature/humidity/wind combinations, weighted by how likely each is.",
    whyItMatters:
      "Marginalization lets you extract answers about specific variables from complex joint distributions. It's essential for making predictions, computing evidence (model comparison), and handling missing data.",
    exampleUses: [
      "Integrating out latent variables in a variational autoencoder",
      "Computing the marginal likelihood for Bayesian model selection",
      "Summing over hidden states in the forward algorithm for HMMs",
    ],
  },

  mcmc_kernel: {
    title: "MCMC Kernel",
    emoji: "🎯",
    oneLiner: "The core transition rule that generates the next sample in a Markov chain.",
    explanation:
      "An MCMC (Markov Chain Monte Carlo) kernel defines the rule for moving from the current state to a proposed next state. It encapsulates the accept/reject logic that ensures the chain's long-run distribution matches the target. Different kernels (Metropolis-Hastings, Hamiltonian, slice sampling) offer different trade-offs between simplicity, efficiency, and the ability to handle high-dimensional spaces.",
    realWorldAnalogy:
      "A random walk in a hilly landscape where you're more likely to accept steps that take you uphill (toward higher probability). The specific rules for proposing steps and deciding whether to take them define the kernel.",
    whyItMatters:
      "The kernel determines how efficiently an MCMC sampler explores the target distribution. A well-chosen kernel converges quickly; a poor one gets stuck or explores too slowly to be useful.",
    exampleUses: [
      "Metropolis-Hastings kernel with Gaussian proposals for parameter estimation",
      "Hamiltonian Monte Carlo kernel using gradient information for efficient exploration",
      "Gibbs sampling kernel that updates one variable at a time from its conditional",
    ],
  },

  mcmc_proposal: {
    title: "MCMC Proposal",
    emoji: "💡",
    oneLiner: "Suggesting where the Markov chain should try to go next.",
    explanation:
      "An MCMC proposal generates a candidate next state for the chain. The proposal distribution determines what states get suggested -- it might be a small random step from the current position, a jump informed by the gradient of the target, or a draw from a learned approximation. The quality of proposals directly affects sampling efficiency: good proposals suggest states the chain is likely to accept.",
    realWorldAnalogy:
      "A friend suggesting restaurants for dinner. A good suggester considers what you like and proposes places you'll probably enjoy (high acceptance rate). A bad suggester picks randomly from the phone book (most suggestions rejected).",
    whyItMatters:
      "Proposal quality is the bottleneck of MCMC. Too-small proposals waste time; too-large proposals get rejected. Adaptive and gradient-informed proposals dramatically reduce the number of samples needed.",
    exampleUses: [
      "Gaussian random walk proposal with tuned step size",
      "Langevin proposal using gradient information to guide steps",
      "Independent proposal from a variational approximation to the posterior",
    ],
  },

  message_passing: {
    title: "Message Passing",
    emoji: "💬",
    oneLiner: "Nodes in a graph exchanging information with their neighbors to build up global understanding.",
    explanation:
      "Message passing is a computation pattern where each node in a graph sends a message to its neighbors, receives messages back, and updates its own state based on what it hears. After several rounds, each node has information not just about itself but about the broader graph structure. This is the foundation of belief propagation, graph neural networks, and loopy inference algorithms.",
    realWorldAnalogy:
      "A game of telephone, but useful. Each person in a circle whispers what they know to their neighbors. After several rounds, everyone has a summary of what the whole group knows, even though no one talked to everyone directly.",
    whyItMatters:
      "Message passing lets algorithms reason about relational data -- social networks, molecules, knowledge graphs -- by propagating local information into global understanding. Graph neural networks, which power many state-of-the-art systems, are built on this pattern.",
    exampleUses: [
      "Graph neural network layers aggregating neighbor features for node classification",
      "Belief propagation computing marginals in a probabilistic graphical model",
      "Label propagation spreading known labels to unlabeled nodes in a semi-supervised setting",
    ],
  },

  observability: {
    title: "Observability",
    emoji: "👁️",
    oneLiner: "Logging, monitoring, and inspecting what's happening inside a pipeline.",
    explanation:
      "Observability stages instrument a pipeline to make its internal state visible. This includes logging intermediate values, recording metrics (loss curves, gradient norms, data statistics), writing checkpoints, and generating diagnostic visualizations. These stages don't change the computation -- they make it transparent so you can debug, monitor, and understand what's happening.",
    realWorldAnalogy:
      "The dashboard in a car. The speedometer, fuel gauge, and engine temperature light don't make the car go -- but without them you'd have no idea if something was wrong until it was too late.",
    whyItMatters:
      "Algorithms fail silently. Without observability, a model can train for hours on corrupted data, or a pipeline can produce wrong results that look plausible. Logging and monitoring catch problems early.",
    exampleUses: [
      "Logging training loss and validation accuracy each epoch",
      "Recording gradient norms to detect vanishing or exploding gradients",
      "Writing model checkpoints every N steps for recovery after crashes",
    ],
  },

  oracle_gradient: {
    title: "Oracle Gradient",
    emoji: "🔮",
    oneLiner: "Obtaining gradients from a model or system treated as a black box.",
    explanation:
      "Oracle gradient stages compute or approximate gradients of a function that's accessed through a query interface rather than through its source code. This is common in adversarial attacks (querying a model's API to estimate gradients), black-box optimization (finite-difference approximation), and transfer attacks (using one model's gradients as a proxy for another's).",
    realWorldAnalogy:
      "Figuring out which way is downhill when you're blindfolded. You can't see the slope, but you can take a small step in each direction and feel whether you went up or down. From those experiments, you infer the gradient.",
    whyItMatters:
      "Many real-world systems don't expose their internals. Oracle gradient methods let you optimize or attack systems you can only query, which is the realistic setting for deployed ML models.",
    exampleUses: [
      "Finite-difference gradient estimation for black-box adversarial attacks",
      "Using a surrogate model's gradients as a proxy for the target model",
      "Zeroth-order optimization of a simulation with no analytical derivatives",
    ],
  },

  prior_init: {
    title: "Prior Initialization",
    emoji: "🌱",
    oneLiner: "Setting up initial beliefs or parameter values before inference begins.",
    explanation:
      "Prior initialization stages define the starting point for Bayesian inference or iterative algorithms. In Bayesian models, this means specifying prior distributions that encode beliefs before seeing data. In optimization, it means choosing initial parameter values. Good initialization can mean the difference between fast convergence and getting stuck in a bad local minimum.",
    realWorldAnalogy:
      "Setting the starting position in a maze. If you start near the exit, you find it quickly. If you start in a dead-end corner, you waste a lot of time. Prior initialization puts you in a good starting position based on what you already know.",
    whyItMatters:
      "Inference and optimization are sensitive to where they start. Informative priors regularize Bayesian models; smart initialization (like Xavier or He initialization for neural networks) prevents training from stalling.",
    exampleUses: [
      "Specifying weakly informative priors for Bayesian regression coefficients",
      "He initialization for neural network weights to maintain gradient scale",
      "Initializing cluster centers with k-means++ for faster convergence",
    ],
  },

  probabilistic_aggregation: {
    title: "Probabilistic Aggregation",
    emoji: "🎛️",
    oneLiner: "Combining multiple uncertain estimates into a single, better estimate.",
    explanation:
      "Probabilistic aggregation merges predictions, distributions, or beliefs from multiple sources while properly accounting for uncertainty. This includes ensemble averaging (weighting multiple model predictions), mixture models (combining probability distributions), and Bayesian model averaging (weighting models by their posterior probability). The result is typically more robust than any single source.",
    realWorldAnalogy:
      "Asking five doctors for a diagnosis and combining their opinions, giving more weight to the specialists and accounting for how confident each one is. The combined opinion is usually better than any single doctor's.",
    whyItMatters:
      "Aggregating uncertain estimates reduces variance and improves robustness. Ensembles consistently outperform single models in competitions and production systems because they smooth out individual errors.",
    exampleUses: [
      "Averaging predictions from multiple neural networks in an ensemble",
      "Bayesian model averaging over multiple candidate models",
      "Combining sensor readings with different noise levels using inverse-variance weighting",
    ],
  },

  probabilistic_oracle: {
    title: "Probabilistic Oracle",
    emoji: "🎱",
    oneLiner: "A black-box system that returns probability estimates when queried.",
    explanation:
      "A probabilistic oracle is a component that, given an input, returns a probability distribution or score rather than a hard decision. This might be a pretrained classifier that outputs class probabilities, a density estimator, or a simulation that returns stochastic outcomes. The oracle is treated as a black box -- the calling algorithm uses its probabilistic outputs without needing to know how they're computed.",
    realWorldAnalogy:
      "A weather forecasting service that tells you there's a 70% chance of rain, not just 'it will rain.' You use that probability to make decisions (bring an umbrella? cancel the picnic?) without knowing the internals of their weather model.",
    whyItMatters:
      "Probabilistic outputs enable better downstream decision-making under uncertainty. Hard yes/no decisions lose information; probability estimates let later stages weigh confidence and hedge appropriately.",
    exampleUses: [
      "Querying a pretrained classifier for class probability scores",
      "Using a Monte Carlo simulation as a stochastic oracle for optimization",
      "Treating a language model as a probability oracle for text scoring",
    ],
  },

  ranking: {
    title: "Ranking",
    emoji: "📊",
    oneLiner: "Ordering items from best to worst according to some criterion.",
    explanation:
      "Ranking stages sort a set of items by a score or preference. This goes beyond simple sorting: ranking algorithms often learn the scoring function from data (learning to rank), handle ties and partial orders, and optimize ranking-specific metrics like NDCG or MAP. Ranking is distinct from classification because the goal is relative ordering, not absolute labels.",
    realWorldAnalogy:
      "A judge ranking contestants in a talent show. They don't just say 'good' or 'bad' -- they put everyone in order from best to worst, which requires comparing every pair and producing a consistent ordering.",
    whyItMatters:
      "Search engines, recommendation systems, and information retrieval all depend on ranking. Showing users the most relevant items first is the difference between a useful system and a useless one.",
    exampleUses: [
      "Learning to rank search results by relevance using gradient-boosted trees",
      "Ranking product recommendations by predicted click-through rate",
      "Sorting candidate solutions by fitness in an evolutionary algorithm",
    ],
  },

  set_theory: {
    title: "Set Theory",
    emoji: "⊕",
    oneLiner: "Operations on collections: unions, intersections, differences, and membership tests.",
    explanation:
      "Set theory stages perform operations on unordered collections of unique elements. This includes computing unions (everything in either set), intersections (only what's in both), differences (what's in one but not the other), and membership tests (is this element in the set?). These operations are fundamental for combining feature sets, deduplicating results, and computing overlap metrics.",
    realWorldAnalogy:
      "A Venn diagram. The overlapping region is the intersection; the entire shaded area is the union; the non-overlapping parts are the differences. Set operations are the computational version of Venn diagram reasoning.",
    whyItMatters:
      "Data pipelines constantly need to merge, filter, and compare collections. Set operations provide clean, well-defined semantics for these tasks and are the basis for database joins, deduplication, and metric computation.",
    exampleUses: [
      "Computing the intersection-over-union (IoU) metric for object detection",
      "Deduplicating candidate lists by taking the union of multiple sources",
      "Finding features present in the training set but absent from the test set",
    ],
  },

  sorting: {
    title: "Sorting",
    emoji: "↕️",
    oneLiner: "Putting items in order so you can find, compare, or process them efficiently.",
    explanation:
      "Sorting arranges elements in a defined order (ascending, descending, by key). While conceptually simple, sorting is a critical primitive: it enables binary search, produces ranked outputs, groups identical items for aggregation, and is often a preprocessing step that makes downstream algorithms dramatically faster. In ML pipelines, sorting by score enables top-k selection, threshold-based filtering, and non-maximum suppression.",
    realWorldAnalogy:
      "Alphabetizing a bookshelf. Once sorted, finding any book is fast (jump to the right letter). Without sorting, you'd have to scan every spine every time you looked for something.",
    whyItMatters:
      "Sorting is one of the most fundamental operations in computing. It's a prerequisite for efficient searching, merging, deduplication, and any operation that needs to process items in a specific order.",
    exampleUses: [
      "Sorting detection boxes by confidence score for non-maximum suppression",
      "Sorting features by importance score for feature selection",
      "Sorting time-series events chronologically before sequential processing",
    ],
  },

  state_init: {
    title: "State Initialization",
    emoji: "🏁",
    oneLiner: "Setting up the starting state for an iterative or stateful algorithm.",
    explanation:
      "State initialization stages create the initial data structures and values that an iterative algorithm needs before it can start running. This might mean initializing an empty accumulator, setting up a graph with default edge weights, creating the initial population for an evolutionary algorithm, or allocating the state vector for a Kalman filter. The goal is to define a clean, well-specified starting configuration.",
    realWorldAnalogy:
      "Setting up a board game before playing. You place all the pieces in their starting positions, shuffle the cards, and distribute starting resources. The game (algorithm) can't begin until the initial state is ready.",
    whyItMatters:
      "Algorithms with state need a well-defined starting point. Poor initialization can cause slow convergence, numerical instability, or completely wrong results. Getting the initial state right is a prerequisite for everything that follows.",
    exampleUses: [
      "Initializing a zero-valued accumulator for gradient momentum",
      "Setting up an empty visited-nodes set before graph traversal",
      "Creating the initial state vector and covariance matrix for a Kalman filter",
    ],
  },

  time_conversion: {
    title: "Time Conversion",
    emoji: "🕐",
    oneLiner: "Translating between time representations: timestamps, durations, frequencies, and calendars.",
    explanation:
      "Time conversion stages transform temporal data between different representations and reference frames. This includes converting between Unix timestamps and human-readable dates, resampling time series to different frequencies, aligning signals recorded at different sample rates, converting between time zones, and extracting cyclical features (day-of-week, month) from timestamps.",
    realWorldAnalogy:
      "Converting between 12-hour and 24-hour clocks, or between time zones when scheduling a meeting across continents. The underlying moment in time is the same, but the representation changes to suit the context.",
    whyItMatters:
      "Time is messy in practice: different systems use different clocks, sample rates, and conventions. Incorrect time handling causes silent data leakage, misaligned features, and impossible-to-debug prediction errors.",
    exampleUses: [
      "Resampling sensor data from 100Hz to 50Hz for consistency across devices",
      "Extracting day-of-week and hour-of-day as cyclical features from timestamps",
      "Converting GPS timestamps to UTC for synchronization with other sensors",
    ],
  },

  map_over: {
    title: "Map Over",
    emoji: "🔁",
    oneLiner: "Applying the same operation to every item in a collection.",
    explanation:
      "A map-over stage takes a collection (a list of images, a batch of sequences, a set of data points) and applies an identical transformation to each element independently. Because each item is processed the same way with no dependencies between them, map-over operations are naturally parallelizable.",
    realWorldAnalogy:
      "A teacher grading a stack of identical exams. The same rubric is applied to each paper independently. Grading one paper doesn't change how you grade the next. You could even split the stack among multiple graders to go faster.",
    whyItMatters:
      "Map-over is the workhorse of data-parallel computation. GPUs, distributed systems, and batch processing all exploit the independence of map operations to achieve massive speedups.",
    exampleUses: [
      "Resizing every image in a dataset to the same dimensions",
      "Tokenizing each document in a corpus",
      "Applying a trained model to every sample in a test batch",
    ],
  },
};

/** Get the description for a concept type, or a generic fallback. */
export function getConceptDescription(conceptType: string): ConceptDescription {
  return conceptDescriptions[conceptType] ?? {
    title: conceptType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    emoji: "🔷",
    oneLiner: `An algorithmic building block classified as "${conceptType.replace(/_/g, " ")}".`,
    explanation: `This concept type represents a category of algorithmic operations. Atoms and CDG stages tagged with this type share a common computational pattern.`,
    realWorldAnalogy: "",
    whyItMatters: "Understanding algorithm categories helps you recognize patterns across different problems and choose the right tool for the job.",
    exampleUses: [],
  };
}
