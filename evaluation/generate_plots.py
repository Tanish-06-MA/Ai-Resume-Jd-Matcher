"""
============================================================
PLOT GENERATOR - Confusion Matrix and ROC Curve
============================================================

Generates publication-quality confusion matrix and ROC curve
images from the evaluation results.

Usage:  python generate_plots.py <results_csv_path> <output_dir>

Dependencies: matplotlib, scikit-learn, pandas
Install:      pip install matplotlib scikit-learn pandas

============================================================
"""

import sys
import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for saving plots
import matplotlib.pyplot as plt
from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    roc_curve,
    roc_auc_score
)


def generate_confusion_matrix(actuals, predictions, output_path):
    """
    Generate and save a confusion matrix heatmap.
    
    Labels:
        - Actual axis:    No Match (0), Match (1)
        - Predicted axis: No Match (0), Match (1)
    """
    # Compute confusion matrix
    cm = confusion_matrix(actuals, predictions, labels=[0, 1])
    
    # Create figure with custom styling
    fig, ax = plt.subplots(figsize=(8, 6))
    
    # Display labels
    display_labels = ["No Match", "Match"]
    
    # Create heatmap
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=display_labels
    )
    
    disp.plot(
        ax=ax,
        cmap="Blues",
        values_format="d",
        colorbar=True
    )
    
    # Styling
    ax.set_title("Confusion Matrix - AI Resume-JD Matcher", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Predicted Label", fontsize=12, labelpad=10)
    ax.set_ylabel("Actual Label", fontsize=12, labelpad=10)
    
    # Make text larger
    for text in disp.text_.ravel():
        text.set_fontsize(18)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    
    print("  Confusion matrix saved: {}".format(output_path))


def generate_roc_curve(actuals, scores, output_path):
    """
    Generate and save an ROC curve with AUC score.
    
    Uses the raw similarity scores (not thresholded predictions)
    to compute the ROC curve across all possible thresholds.
    """
    # Normalize scores to 0-1 range (they are percentages)
    scores_normalized = np.array(scores) / 100.0
    actuals_array = np.array(actuals)
    
    # Compute ROC curve points
    fpr, tpr, thresholds = roc_curve(actuals_array, scores_normalized)
    
    # Compute AUC score
    auc_score = roc_auc_score(actuals_array, scores_normalized)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(8, 6))
    
    # Plot ROC curve
    ax.plot(
        fpr, tpr,
        color="#2563EB",
        linewidth=2.5,
        label="ROC Curve (AUC = {:.4f})".format(auc_score)
    )
    
    # Plot diagonal reference line (random classifier)
    ax.plot(
        [0, 1], [0, 1],
        color="#9CA3AF",
        linewidth=1.5,
        linestyle="--",
        label="Random Classifier (AUC = 0.5)"
    )
    
    # Fill area under curve
    ax.fill_between(fpr, tpr, alpha=0.15, color="#2563EB")
    
    # Styling
    ax.set_title("ROC Curve - AI Resume-JD Matcher", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("False Positive Rate (FPR)", fontsize=12, labelpad=10)
    ax.set_ylabel("True Positive Rate (TPR)", fontsize=12, labelpad=10)
    ax.legend(loc="lower right", fontsize=11, framealpha=0.9)
    ax.set_xlim([-0.02, 1.02])
    ax.set_ylim([-0.02, 1.02])
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    
    print("  ROC curve saved: {}".format(output_path))
    print("  AUC Score: {:.4f}".format(auc_score))
    
    return auc_score


def main():
    """
    Main function: reads results.csv and generates both plots.
    
    Arguments:
        sys.argv[1] - Path to results.csv
        sys.argv[2] - Output directory for plots
    """
    # Parse command-line arguments
    if len(sys.argv) < 3:
        print("Usage: python generate_plots.py <results_csv_path> <output_dir>")
        sys.exit(1)
    
    results_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Read results CSV
    if not os.path.exists(results_path):
        print("Error: results.csv not found at {}".format(results_path))
        sys.exit(1)
    
    df = pd.read_csv(results_path)
    
    # Extract columns
    actuals = df["ActualLabel"].tolist()
    predictions = df["PredictedLabel"].tolist()
    scores = df["SimilarityScore"].tolist()
    
    print("")
    print("  -- Plot Generation --")
    print("")
    print("  Dataset size: {} pairs".format(len(df)))
    print("  Actual positives (Match): {}".format(sum(actuals)))
    print("  Actual negatives (No Match): {}".format(len(actuals) - sum(actuals)))
    print("")
    
    # Generate Confusion Matrix
    cm_path = os.path.join(output_dir, "confusion_matrix.png")
    generate_confusion_matrix(actuals, predictions, cm_path)
    
    # Generate ROC Curve
    roc_path = os.path.join(output_dir, "roc_curve.png")
    
    # ROC/AUC requires at least one positive and one negative sample
    if len(set(actuals)) >= 2:
        auc = generate_roc_curve(actuals, scores, roc_path)
    else:
        print("  Warning: Cannot generate ROC curve - need both positive and negative samples.")
        auc = None
    
    print("")
    print("  -- Plots generated successfully! --")
    print("")


if __name__ == "__main__":
    main()
