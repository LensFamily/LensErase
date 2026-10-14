<div align="center">

<img src="docs/assets/logo-mark.svg" alt="LensErase logo" width="100" />

# LensErase

### A Foundation Model for Erase Anything

<p>
Yunuo Chen<sup>1,*</sup>, Xiuyu Wu<sup>2,*</sup>, Qinhong Yang<sup>3</sup>, Jinjing Zhao<sup>4</sup>, Yanchen Dong<sup>5</sup>, Sirui Zhang<sup>3</sup>,<br />
Dong Chen<sup>6,‡</sup>, Fangyun Wei<sup>6,†</sup>, Lei Shi<sup>6</sup>, Ji Li<sup>6</sup>, Dongdong Chen<sup>6</sup>,<br />
Guo Lu<sup>1,†</sup>, Yan Lu<sup>6</sup>, Baining Guo<sup>6</sup>
</p>

<p>
<sup>1</sup> Shanghai Jiao Tong University &nbsp; <sup>2</sup> Nankai University &nbsp; <sup>3</sup> USTC<br />
<sup>4</sup> University of Sydney &nbsp; <sup>5</sup> Peking University &nbsp; <sup>6</sup> Microsoft<br />
<sub>* Equal contribution &nbsp; † Corresponding authors &nbsp; ‡ Project lead</sub>
</p>

<p>
<a href="https://lensfamily.github.io/LensErase/"><img src="https://img.shields.io/badge/Project-Page-137D89?style=flat-square" alt="Project page" height="24" /></a>
&nbsp;
<a href="#release-status"><img src="https://img.shields.io/badge/Code-Coming_Soon-233D56?style=flat-square&logo=github&logoColor=white" alt="Code coming soon" height="24" /></a>
&nbsp;
<a href="https://arxiv.org/abs/2610.18072"><img src="https://img.shields.io/badge/Paper-arXiv-B64A46?style=flat-square" alt="Paper on arXiv" height="24" /></a>
&nbsp;
<a href="https://github.com/LensFamily/LensErase"><img src="https://img.shields.io/github/stars/LensFamily/LensErase?style=social" alt="GitHub stars" height="24" /></a>
</p>

**Code coming soon.** If you like LensErase, please consider starring this repository.

<a href="https://lensfamily.github.io/LensErase/"><img src="assets/teaser.jpg" alt="LensErase selected inputs and removal results for general objects, visual text, watermarks, multiple objects, associated effects, and high-fidelity inpainting" width="100%" /></a>

<sub>Selected inputs and LensErase outputs. Visit the project page for animated examples and model comparisons.</sub>

</div>

## Overview

**LensErase** is a general-purpose, mask-based foundation model for object removal. Given an image and a selection mask, it removes the selected content and associated visual effects, fills the revealed region, and preserves the rest of the image. It supports general objects, visual text, watermarks, and layered posters, including multiple targets and semi-transparent content.

## Highlights

- **An image and a mask.** Specify the region to erase without a text prompt.
- **Beyond the selected object.** Remove associated shadows and reflections while preserving nearby content.
- **A generative foundation for erasure.** Adapt the pretrained [Lens](https://github.com/LensFamily/Lens) model with Mask-Aware RoPE, then refine removals through supervised fine-tuning and contract-guided reinforcement learning.
- **High-fidelity preservation.** TraceFusion uses image residuals to identify the effective edit region and preserve content elsewhere.

## Data and Evaluation

| Resource | Scale | Description |
| :--- | :---: | :--- |
| **LensErase-100M** | **101.07M** paired examples | Source–mask–target triplets spanning general objects, watermarks, large masks, visual text, and posters. |
| **LensErase-Bench** | **500** cases | General objects, posters, watermarks, and visual text, evaluated without requiring a paired ground-truth target. |

LensErase-Bench evaluates **Removal**, **Inpainting**, **Preservation**, and **Cleanliness**, together with an Overall Score and **HiFi Removal**. The [project page](https://lensfamily.github.io/LensErase/#benchmark) describes the benchmark and its metrics.

## Examples

Explore the [animated removal demos](https://lensfamily.github.io/LensErase/#featured), [additional examples](https://lensfamily.github.io/LensErase/#showcase), and qualitative comparisons with [GPT-Image 2.5 and Flux2-Erase](https://lensfamily.github.io/LensErase/#commercial) and [open-source models](https://lensfamily.github.io/LensErase/#open-source).

## Release Status

**Code coming soon.** The code will be released in this repository.

### Paper

[LensErase: A Foundation Model for Erase Anything](https://arxiv.org/abs/2610.18072) (arXiv:2610.18072).

## Related Project

[Lens: Rethinking Training Efficiency for Foundational Text-to-Image Models](https://github.com/LensFamily/Lens) provides the pretrained text-to-image foundation for LensErase.
