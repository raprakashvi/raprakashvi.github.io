# AI literature for Vestigium

An annotated bibliography and experiment map for Vestigium's deep-learning work: relationships among about 2,830 historical tools across images, multilingual catalog text, 2-D silhouettes and multimodal representations, and provisional multi-label function hypotheses.

**Status and verification (2026-10-22).** The bibliography has 47 entries, and every one has been checked to exist:

- DOIs were resolved through the Crossref API, which confirmed title, authors, venue and pages.
- arXiv identifiers were resolved through the arXiv API, and dataset or model URLs returned HTTP 200.
- Summaries come from abstracts, or from open full text where available (Europe PMC for Aeneas, Nazca and the CT paper).
- Licence notes come from the host pages on the same date and **must be rechecked before any download or redistribution**.
- Nothing here is a Vestigium result. Implications are proposed controls or experiments, not findings.

The machine-readable version is in `results/tables/ai_literature.json`, using the same IDs.

**How to read the entries.** Each entry gives the full citation and DOI or URL, two to four sentences on what the work did, and one concrete implication for Vestigium. Section 2 maps the literature to experiments and controls. Section 3 lists candidate external models and datasets with licence notes.

---

## 1. Annotated bibliography


### A. Reference studies: AI for heritage discovery, human–AI evaluation, 3-D

**[assael2022_ithaca]** Assael Y, Sommerschield T, Shillingford B, Bordbar M, Pavlopoulos J, Chatzipanagiotou M, Androutsopoulos I, Prag J, de Freitas N (2022). *Restoring and attributing ancient texts using deep neural networks*. Nature 603(7900):280–283. <https://doi.org/10.1038/s41586-022-04448-z>  
Ithaca is a transformer that restores damaged Greek inscriptions and attributes their place and date. Alone it reached 62% restoration accuracy; historians improved from 25% to 72% when using it. Attribution reached 71% for region, and dates fell within 30 years of ground-truth ranges. It returns ranked hypotheses, distributions over regions and dates, and saliency maps instead of a single answer.  
→ *Implication for Vestigium:* Show function hypotheses as ranked candidates with distributions and evidence. Judge the expert+model team against experts alone in a controlled protocol, not by model accuracy alone.

**[assael2025_aeneas]** Assael Y, Sommerschield T, Cooley A, Shillingford B, Pavlopoulos J, Suresh P, Herms B, Grayston J, Maynard B, Dietrich N, Wulgaert R, Prag J, Mullen A, Mohamed S (2025). *Contextualizing ancient texts with generative neural networks*. Nature 645(8079):141–147. <https://doi.org/10.1038/s41586-025-09292-5>  
Aeneas restores Latin inscriptions, including gaps of unknown length, and attributes date and place, using the image only for place. It retrieves 'parallels' by cosine similarity on a 'historically enriched' embedding built from the intermediate representations feeding its supervised task heads. In a study with 23 epigraphers, retrieved parallels were useful starting points in 90% of cases. Expert+AI beat either alone on restoration and place. The corpus was deduplicated by identifier plus MinHash/fuzzy matching at >90% similarity, and images were withheld from restoration to prevent leakage.  
→ *Implication for Vestigium:* (i) Build retrieval embeddings from heads trained on auxiliary targets (period, source-independent type), not raw generic features. (ii) Evaluate parallels by experts' judgment of 'useful starting point'. (iii) Copy the explicit dedup and modality-leakage reasoning: catalog text that names a function must not be an input when predicting function.

**[sakai2024_nazca]** Sakai M, Sakurai A, Lu S, Olano J, Albrecht CM, Hamann HF, Freitag M (2024). *AI-accelerated Nazca survey nearly doubles the number of known figurative geoglyphs and sheds light on their purpose*. PNAS 121(40):e2407652121. <https://doi.org/10.1073/pnas.2407652121>  
A patch classifier was trained on about 400 known relief geoglyphs: 368 train and 33 validation positives, with negatives sampled from their surroundings and heavy augmentation. It was run over 629 km² of aerial imagery. Archaeologists screened 47,410 candidate boxes down to 1,309 high-potential candidates ranked I–III, about 36 suggestions per promising candidate. Field visits to 341 locations confirmed 303 new figurative geoglyphs, of which 178 were individually AI-suggested and 59 were found without AI.  
→ *Implication for Vestigium:* Treat relationship and function suggestions as a low-precision triage queue. Budget review explicitly (suggestions reviewed per accepted finding), report yield by rank, and keep a non-AI discovery channel as a comparator.

**[bossema2024_ct]** Bossema FG, Palenstijn WJ, Heginbotham A, Corona M, van Leeuwen T, van Liere R, Dorscheid J, O'Flynn D, Dyer J, Hermens E, Batenburg KJ (2024). *Enabling 3D CT-scanning of cultural heritage objects using only in-house 2D X-ray equipment in museums*. Nature Communications 15:3939. <https://doi.org/10.1038/s41467-024-48102-w>  
Small metal-ball markers scanned with the object let the unknown acquisition geometry be estimated from each radiograph. An algebraic iterative reconstruction (SIRT) then produces CT volumes on uncalibrated 2-D radiography set-ups, shown at the British Museum, the Getty and the Rijksmuseum. The method is not deep learning: geometry is recovered computationally instead of by hardware calibration.  
→ *Implication for Vestigium:* Catalog silhouettes are lossy and depend on viewpoint. For a stratified subset of hinged, ratcheted or hollow instruments, 3-D or internal data would test whether 2-D shape similarity holds in 3-D. Estimate scale and pose from in-image references (rulers, markers) instead of assuming them.


### B. Deep learning on archaeological and museum objects

**[anichini2021_archaide]** Anichini F, Dershowitz N, Dubbini N, Gattiglia G, Itkin B, Wolf L (2021). *The automatic recognition of ceramics from only one photo: The ArchAIDE app*. Journal of Archaeological Science: Reports 36:102788. <https://doi.org/10.1016/j.jasrep.2020.102788>  
Two networks propose pottery types from one field photo: one from the sherd's profile outline (points along inner and outer surfaces), one from decoration. The authors handle scarce labels, extreme class imbalance and rare types. The app proposes candidates and the specialist decides.  
→ *Implication for Vestigium:* Outline-based deep models work for typing when the outline is well defined. Keep silhouette and appearance as separate evidence channels and return top-k candidates for expert confirmation.

**[pawlowicz2021_ceramics]** Pawlowicz LM, Downum CE (2021). *Applications of deep learning to decorated ceramic typology and classification: A case study using Tusayan White Ware from Northeast Arizona*. Journal of Archaeological Science 130:105375. <https://doi.org/10.1016/j.jas.2021.105375>  
A CNN assigns sherd photographs to an existing typology with accuracy comparable to, and sometimes above, four expert archaeologists. It also visualises diagnostic design elements and retrieves the most similar sherds from thousands of photos.  
→ *Implication for Vestigium:* Benchmark the model against several independent experts and report expert–expert agreement as the ceiling. Vestigium's pilot review needs at least two independent raters per item.

**[anwar2021_coins]** Anwar H, Anwar S, Zambanini S, Porikli F (2021). *Deep ancient Roman Republican coin classification via feature fusion and attention*. Pattern Recognition 114:107871. <https://doi.org/10.1016/j.patcog.2021.107871>  
Fine-grained Roman Republican coin types are classified from reverse images using CNN feature fusion and attention. Many classes share the same main motif and differ only in small symbols or legends. A separate disjoint test set, RRCD-Disjoint, contains only classes unseen in training (preprint arXiv:1908.09428).  
→ *Implication for Vestigium:* Fine distinctions such as jaw serration or lock type need local, attention-based features. Test generalisation on held-out types, not only on held-out photos of seen types.

**[winterbottom2022_instances]** Winterbottom T, Leone A, Al Moubayed N (2022). *A deep learning approach to fight illicit trafficking of antiquities using artefact instance classification*. Scientific Reports 12:13468. <https://doi.org/10.1038/s41598-022-15965-2>  
Instance classification over 24,502 photos of 4,332 Durham Oriental Museum objects. The exact object was identified about 72% of the time top-1 (up to ~83% with more photos per object, 84% with an ensemble) and about 95% within the top 10.  
→ *Implication for Vestigium:* CNNs re-identify the same object across photos easily. Views or duplicate catalog records of one object split across train and test will inflate scores. Split by object and duplicate group, and use instance re-identification deliberately as a leakage detector.

**[mensink2014_rijksmuseum]** Mensink T, van Gemert J (2014). *The Rijksmuseum Challenge: Museum-centered visual recognition*. Proc. ACM International Conference on Multimedia Retrieval (ICMR), 451–454. <https://doi.org/10.1145/2578726.2578791>  
A benchmark of 112,039 Rijksmuseum photographs with four tasks: predict artist, object type, material and creation year. Fisher-vector baselines are included.  
→ *Implication for Vestigium:* Material, type and date are predictable from museum images, so they can act as proxies for function labels. Rijksmuseum CC0 images are a possible Dutch out-of-collection control set.

**[banar2023_iconclass]** Banar N, Daelemans W, Kestemont M (2023). *Transfer learning for the visual arts: The multi-modal retrieval of Iconclass codes*. ACM Journal on Computing and Cultural Heritage 16(2):1–16. <https://doi.org/10.1145/3575865>  
A fully fine-tunable retrieval framework assigns Iconclass codes to artworks. Multilingual titles and image features are matched against the textual definitions of the codes, which addresses many labels with little training data.  
→ *Implication for Vestigium:* Cast function labels as retrieval against written, multilingual label definitions (e.g. 'extraction: removal of a tooth, foreign body or fetus'). This makes label semantics explicit and auditable and allows zero- or few-shot labels.

**[smits2023_multimodal]** Smits T, Wevers M (2023). *A multimodal turn in Digital Humanities. Using contrastive machine learning models to explore, enrich, and analyze digital visual historical collections*. Digital Scholarship in the Humanities 38(3):1267–1280. <https://doi.org/10.1093/llc/fqad008>  
Three case studies show CLIP-style models supporting text-to-image, image-to-image and zero-shot exploration of historical visual collections. The authors warn of historical bias inherited from web training data.  
→ *Implication for Vestigium:* CLIP zero-shot queries suit exploration but carry modern-web priors, such as mapping antique objects onto modern categories. Audit them before using any output as evidence.

**[toumarkine2025_beyond_accuracy]** Toumarkine A, Vidal-Gorène C (2025). *Beyond Accuracy: Investigating Vision Model Perception on 19th-Century Decorative Arts*. Anthology of Computers and the Humanities 3. <https://doi.org/10.63744/k4Jy3Lr4rdK5>  
VGG16, EfficientNet, ViT, DINOv2 and CLIP are compared for zero-shot clustering and similarity retrieval on 19th-century decorative arts, with aggregated activation maps. The models often attended to background contrast and image framing rather than decorative structure.  
→ *Implication for Vestigium:* Direct evidence that off-the-shelf embeddings of heritage photos encode photographic framing. Test image retrieval on masked and background-normalised crops and publish attribution maps.


### C. Outline shape and morphometrics

**[bonhomme2014_momocs]** Bonhomme V, Picq S, Gaucherel C, Claude J (2014). *Momocs: Outline analysis using R*. Journal of Statistical Software 56(13). <https://doi.org/10.18637/jss.v056.i13>  
An R package for outline morphometrics: elliptic Fourier and related descriptors, normalisation for size, rotation and starting point, and PCA/LDA in a reproducible pipeline.  
→ *Implication for Vestigium:* A reference implementation for cross-checking Vestigium's Fourier shape block, and the interpretable baseline any learned silhouette embedding must beat.

**[okumura2019_gm_borrowing]** Okumura M, Araujo AGM (2019). *Archaeology, biology, and borrowing: A critical examination of Geometric Morphometrics in Archaeology*. Journal of Archaeological Science 101:149–158. <https://doi.org/10.1016/j.jas.2017.09.015>  
A critique of how archaeology has borrowed geometric morphometrics. Biological concepts such as landmark homology, modularity and allometry are often applied to artefacts without justification.  
→ *Implication for Vestigium:* Corresponding points on tools (jaw tip, pivot, handle end) are design or functional correspondences, not biological homologies. Define them explicitly and keep homology language out of shape outputs.


### D. Inferring function from form: use-wear and affordances

**[zhang2024_luwa]** Zhang J, Fang I, Wu H, Kaushik A, Rodriguez A, Zhao H, Zhang J, Zheng Z, Iovita R, Feng C (2024). *LUWA Dataset: Learning Lithic Use-Wear Analysis on Microscopic Images*. Proc. IEEE/CVF CVPR, 22563–22573. <https://doi.org/10.1109/CVPR52733.2024.02129>  
An open dataset of 23,130 microscopic images of experimentally used stone tools, labelled by worked material, across magnifications and sensing modalities. Pretrained models including DINOv2 and few-shot methods are benchmarked. They beat human experts but leave a large gap, and imaging conditions are strong confounders.  
→ *Implication for Vestigium:* Function is best evidenced by use-traces under controlled experiments, which catalog thumbnails cannot show. Function inferred from form must stay a hypothesis, and imaging modality and scale must be stratified as confounders.

**[eleftheriadou2025_polish]** Eleftheriadou A, Djellal Y, McPherron SP, Marreiros J (2025). *Classifying polish in use-wear analysis with convolutional neural networks*. Scientific Reports 15:36834. <https://doi.org/10.1038/s41598-025-18179-4>  
CNNs classify experimental use-wear polish by contact material (wood, hide, bone) and by duration of use. Bone and hide were classified well and wood poorly. Custom models beat pretrained ones on small surface patches, and image scale mattered.  
→ *Implication for Vestigium:* Pretrained features are not automatically better for small, domain-specific data. Keep a small-capacity or from-scratch baseline and test crop size and resolution.

**[myers2015_umd_affordance]** Myers A, Teo CL, Fermüller C, Aloimonos Y (2015). *Affordance detection of tool parts from geometric features*. Proc. IEEE ICRA, 1374–1381. <https://doi.org/10.1109/ICRA.2015.7139369>  
Introduces the UMD RGB-D part-affordance dataset: 105 kitchen, workshop and garden tools with pixel labels for grasp, cut, scoop, contain, pound, support and wrap-grasp, plus ranked affordances per part. Part affordances are detected from local geometric features.  
→ *Implication for Vestigium:* Function belongs to parts (blade, jaws, handle), and a part can carry several ranked affordances. This supports multi-label, part-localised hypotheses rather than single whole-object labels.

**[zhu2015_understanding_tools]** Zhu Y, Zhao Y, Zhu S-C (2015). *Understanding tools: Task-oriented object modeling, learning and recognition*. Proc. IEEE CVPR, 2855–2864. <https://doi.org/10.1109/CVPR.2015.7298903>  
Tools are modelled by four components: a grasp region, a functional region acting on the target, an imagined action trajectory, and the physical quantity produced (force, pressure). Learning from one RGB-D demonstration, the model picks substitute tools, including stones, for new tasks.  
→ *Implication for Vestigium:* Functional equivalence comes from mechanism (contact geometry, force, action), not visual likeness. Tie Vestigium's function labels to explicit mechanical criteria such as pivot or lever, jaw opposition and edge, so they can be checked.

**[abelha2016_substitute_tools]** Abelha P, Guerin F, Schoeler M (2016). *A model-based approach to finding substitute tools in 3D vision data*. Proc. IEEE ICRA, 2471–2478. <https://doi.org/10.1109/ICRA.2016.7487400>  
Candidate objects are segmented into parts and each part is fitted with a superquadric. Part parameters are compared with those the task requires, to find tools that can substitute for a missing one.  
→ *Implication for Vestigium:* Gives an operational, part-parametric definition of functional similarity, distinct from overall visual similarity. A working-end descriptor comparison is a principled baseline for function-oriented retrieval.


### E. Foundation and self-supervised representations

**[radford2021_clip]** Radford A, Kim JW, Hallacy C, Ramesh A, Goh G, Agarwal S, Sastry G, Askell A, Mishkin P, Clark J, Krueger G, Sutskever I (2021). *Learning transferable visual models from natural language supervision*. Proc. ICML, PMLR 139:8748–8763. <https://proceedings.mlr.press/v139/radford21a.html>  
Contrastive image–text pretraining on 400M web pairs, enabling zero-shot transfer through text prompts.  
→ *Implication for Vestigium:* A baseline for zero-shot function prompts and image–text retrieval. The training data are undisclosed, so prior exposure to museum images cannot be ruled out, and zero-shot results are not independent evidence.

**[cherti2023_openclip]** Cherti M, Beaumont R, Wightman R, Wortsman M, Ilharco G, Gordon C, Schuhmann C, Schmidt L, Jitsev J (2023). *Reproducible scaling laws for contrastive language-image learning*. Proc. IEEE/CVF CVPR, 2818–2829. <https://doi.org/10.1109/CVPR52729.2023.00276>  
An open reproduction of CLIP training on public LAION data, with scaling laws, open code and open weights (OpenCLIP).  
→ *Implication for Vestigium:* Known pretraining data make it possible to check for contamination, e.g. whether collection images appear in LAION. Prefer it over closed CLIP for reproducibility.

**[zhai2023_siglip]** Zhai X, Mustafa B, Kolesnikov A, Beyer L (2023). *Sigmoid loss for language image pre-training*. Proc. IEEE/CVF ICCV, 11941–11952. <https://doi.org/10.1109/ICCV51070.2023.01100>  
Replaces the batch-softmax contrastive loss with an independent pairwise sigmoid loss, which works well at small batch sizes. SigLIP 2 (Tschannen et al. 2025, arXiv:2502.14786) adds multilingual training and better dense features.  
→ *Implication for Vestigium:* Suited to contrastive fine-tuning on only ~2.8k image–text pairs. SigLIP 2's multilingual text tower is relevant to Dutch and Swedish catalog text.

**[oquab2024_dinov2]** Oquab M, Darcet T, Moutakanni T, Vo H, Szafraniec M, Khalidov V, Fernandez P, Haziza D, Massa F, El-Nouby A, et al. (2024). *DINOv2: Learning robust visual features without supervision*. Transactions on Machine Learning Research (arXiv:2304.07193). <https://arxiv.org/abs/2304.07193>  
Self-supervised ViTs trained on 142M curated images give strong frozen features for classification, retrieval and dense tasks; code and weights are Apache-2.0. DINOv3 (Siméoni et al. 2025, arXiv:2508.10104) scales this up under a custom, gated licence.  
→ *Implication for Vestigium:* The default frozen image backbone to replace the ImageNet ResNet18 baseline. Evaluate it frozen (kNN, linear probe) before any fine-tuning.

**[stevens2024_bioclip]** Stevens S, Wu J, Thompson MJ, Campolongo EG, Song CH, Carlyn DE, Dong L, Dahdul WM, Stewart C, Berger-Wolf T, Chao W-L, Su Y (2024). *BioCLIP: A vision foundation model for the tree of life*. Proc. IEEE/CVF CVPR, 19412–19424. <https://doi.org/10.1109/CVPR52733.2024.01836>  
A CLIP model trained on TreeOfLife-10M with taxonomic name strings as text. It gains 16–17 points absolute on fine-grained biology tasks, and its embedding forms a hierarchy that matches the taxonomy.  
→ *Implication for Vestigium:* A template for putting a label hierarchy (family → type → variant, or function → mechanism) into text supervision. The resulting hierarchy reflects the labels supplied, not a discovered genealogy.

**[amir2022_vit_descriptors]** Amir S, Gandelsman Y, Bagon S, Dekel T (2023). *On the effectiveness of ViT features as local semantic descriptors (arXiv: Deep ViT features as dense visual descriptors)*. ECCV 2022 Workshops, LNCS (Springer). <https://doi.org/10.1007/978-3-031-25069-9_3>  
Patch features from self-supervised DINO-ViT encode localised, part-level semantics that are shared across related categories. Simple clustering of these features gives zero-shot co-segmentation, part co-segmentation and semantic correspondence (arXiv:2112.05814).  
→ *Implication for Vestigium:* Enables part-aware comparison (jaws to jaws, handles to handles) without part labels. Compute working-end similarity separately from handles and decoration.

**[wortsman2022_wiseft]** Wortsman M, Ilharco G, Kim JW, Li M, Kornblith S, Roelofs R, Gontijo Lopes R, Hajishirzi H, Farhadi A, Namkoong H, Schmidt L (2022). *Robust fine-tuning of zero-shot models*. Proc. IEEE/CVF CVPR, 7949–7961. <https://doi.org/10.1109/CVPR52688.2022.00780>  
WiSE-FT averages the weights of a zero-shot model and its fine-tuned version. This keeps robustness to distribution shift while gaining in-distribution accuracy.  
→ *Implication for Vestigium:* When fine-tuning on few Vestigium pairs, interpolate with zero-shot weights. Report performance on held-out sources (a real distribution shift), not only random splits.

**[reimers2020_multilingual]** Reimers N, Gurevych I (2020). *Making monolingual sentence embeddings multilingual using knowledge distillation*. Proc. EMNLP, 4512–4525. <https://doi.org/10.18653/v1/2020.emnlp-main.365>  
Multilingual sentence encoders are distilled from a monolingual teacher using translated pairs, aligning 50+ languages in one space.  
→ *Implication for Vestigium:* Add a multilingual encoder alongside TF-IDF so Dutch, Swedish and English descriptions of similar objects align. Test explicitly whether text clusters are really language or museum clusters.


### F. Shortcuts, confounders, leakage and evaluation

**[geirhos2020_shortcut]** Geirhos R, Jacobsen J-H, Michaelis C, Zemel R, Brendel W, Bethge M, Wichmann FA (2020). *Shortcut learning in deep neural networks*. Nature Machine Intelligence 2(11):665–673. <https://doi.org/10.1038/s42256-020-00257-z>  
Defines shortcut learning: decision rules that score well on standard benchmarks but fail under distribution shift. The authors recommend out-of-distribution tests as standard practice.  
→ *Implication for Vestigium:* Make out-of-distribution tests (leave-one-museum-out, leave-one-photo-campaign-out) primary evidence, not appendices.

**[lapuschkin2019_cleverhans]** Lapuschkin S, Wäldchen S, Binder A, Montavon G, Samek W, Müller K-R (2019). *Unmasking Clever Hans predictors and assessing what machines really learn*. Nature Communications 10:1096. <https://doi.org/10.1038/s41467-019-08987-4>  
Relevance maps (LRP) and Spectral Relevance Analysis (SpRAy) expose 'Clever Hans' strategies, such as a PASCAL VOC horse classifier keying on a source watermark. Standard accuracy metrics cannot tell these strategies apart.  
→ *Implication for Vestigium:* Museum thumbnails contain rulers, accession labels, colour charts, mounts and watermarks. Cluster relevance maps to find neighbours or labels driven by these artefacts.

**[zech2018_hospital_confound]** Zech JR, Badgeley MA, Liu M, Costa AB, Titano JJ, Oermann EK (2018). *Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs: A cross-sectional study*. PLOS Medicine 15(11):e1002683. <https://doi.org/10.1371/journal.pmed.1002683>  
CNNs trained on 158,323 radiographs from three hospital systems generalised worse to external sites. They could identify the source hospital and department very accurately and exploited prevalence differences between sites.  
→ *Implication for Vestigium:* A direct analogue of the museum confound. If function base rates differ by source, source-identifying features will 'predict' function. Measure how well each embedding predicts source, and report function results within and across sources.

**[torralba2011_dataset_bias]** Torralba A, Efros AA (2011). *Unbiased look at dataset bias*. Proc. IEEE CVPR, 1521–1528. <https://doi.org/10.1109/CVPR.2011.5995347>  
In the 'Name That Dataset' test, classifiers easily identify which benchmark an image came from, and cross-dataset generalisation drops substantially.  
→ *Implication for Vestigium:* Run 'Name That Museum': a linear probe predicting source collection from each representation. High accuracy flags bias that retrieval must control, e.g. by source-stratified or cross-source neighbours.

**[xiao2021_backgrounds]** Xiao K, Engstrom L, Ilyas A, Madry A (2021). *Noise or signal: The role of image backgrounds in object recognition*. ICLR 2021 (arXiv:2006.09994). <https://arxiv.org/abs/2006.09994>  
A toolkit separating foreground from background on ImageNet. Models reach non-trivial accuracy from backgrounds alone, and adversarial backgrounds flip up to 87.5% of correctly classified foregrounds. More accurate models rely less on backgrounds.  
→ *Implication for Vestigium:* Build background-only, foreground-only (masked) and swapped-background variants of collection images to measure how much retrieval depends on background.

**[geirhos2019_texture]** Geirhos R, Rubisch P, Michaelis C, Bethge M, Wichmann FA, Brendel W (2019). *ImageNet-trained CNNs are biased towards texture; increasing shape bias improves accuracy and robustness*. ICLR 2019 (arXiv:1811.12231). <https://arxiv.org/abs/1811.12231>  
Cue-conflict experiments indicate that ImageNet CNNs favour texture over shape, and training on Stylized-ImageNet raises shape bias. Counterpoint: Burgert, Stoll, Rota & Demir (NeurIPS 2025, https://doi.org/10.52202/085713-2033) use controlled cue suppression and find reliance mainly on local shape, varying by domain.  
→ *Implication for Vestigium:* The field disagrees, so do not assume which cues a model uses on metal instruments (patina, finish, colour or outline). Measure it on Vestigium data with silhouette-only, grayscale and texture-scrambled inputs.

**[kapoor2023_leakage]** Kapoor S, Narayanan A (2023). *Leakage and the reproducibility crisis in machine-learning-based science*. Patterns 4(9):100804. <https://doi.org/10.1016/j.patter.2023.100804>  
Finds leakage in 294 papers across 17 fields, gives a taxonomy of eight leakage types, and proposes 'model info sheets'. In a corrected civil-war-prediction case, complex models were no better than logistic regression.  
→ *Implication for Vestigium:* Complete a model info sheet per experiment. Labels derived from catalog text, evaluated by a model that also sees that text, are a textbook leakage case.

**[barz2020_near_duplicates]** Barz B, Denzler J (2020). *Do we train on test data? Purging CIFAR of near-duplicates*. Journal of Imaging 6(6):41. <https://doi.org/10.3390/jimaging6060041>  
Near-duplicates of training images make up 3.3% (CIFAR-10) and 10% (CIFAR-100) of test images. Replacing them lowered accuracy by 9–14% relative.  
→ *Implication for Vestigium:* Run perceptual-hash and embedding near-duplicate detection across all sources (re-used thumbnails, the same object in several catalogs). Report scores with and without near-duplicate pairs.

**[musgrave2020_metric_reality]** Musgrave K, Belongie S, Lim S-N (2020). *A metric learning reality check*. ECCV 2020, LNCS, 681–699. <https://doi.org/10.1007/978-3-030-58595-2_41>  
Finds methodological flaws in metric-learning papers, including unequal settings and tuning on test data. Under fair comparison, gains were marginal. Proposes MAP@R.  
→ *Implication for Vestigium:* Fix hyperparameters on validation data only, match embedding size and augmentation, and report rank-aware metrics (MAP@R, recall@k) against simple baselines (TF-IDF, Fourier).

**[kornblith2019_cka]** Kornblith S, Norouzi M, Lee H, Hinton G (2019). *Similarity of neural network representations revisited*. Proc. ICML, PMLR 97:3519–3529. <https://proceedings.mlr.press/v97/kornblith19a.html>  
Introduces centered kernel alignment (CKA), a reliable measure of similarity between representations that is invariant to orthogonal transforms and isotropic scaling.  
→ *Implication for Vestigium:* Without ground truth, compare text, shape and image representations with CKA and k-NN overlap, and against nuisance representations (source ID, photo statistics), to see what each embedding mainly encodes.

**[cole2021_single_positive]** Cole E, Mac Aodha O, Lorieul T, Perona P, Morris D, Jojic N (2021). *Multi-label learning from single positive labels*. Proc. IEEE/CVF CVPR, 933–942. <https://doi.org/10.1109/CVPR46437.2021.00099>  
Studies multi-label training where each image has one confirmed positive and all other labels are unobserved. Treating unobserved labels as negatives hurts; expected-positive regularisation and label estimation help.  
→ *Implication for Vestigium:* The formal counterpart of Vestigium's 'missing = unknown' rule. Never train with assumed negatives; use partial-label losses and report how many positives each label had.

**[angelopoulos2023_conformal]** Angelopoulos AN, Bates S (2023). *Conformal prediction: A gentle introduction*. Foundations and Trends in Machine Learning 16(4):494–591. <https://doi.org/10.1561/2200000101>  
A tutorial on conformal prediction: prediction sets with distribution-free, finite-sample coverage under exchangeability, given a held-out calibration set. Extensions cover multi-label prediction and risk control.  
→ *Implication for Vestigium:* Once an adjudicated calibration set exists, turn neighbour-vote scores into label sets with stated coverage and explicit abstention; until then they remain uncalibrated. Exchangeability likely fails across museums, so check coverage per source.


### G. Phylogenetics, convergence and homology of artefacts

**[obrien2001_cladistics]** O'Brien MJ, Darwent J, Lyman RL (2001). *Cladistics is useful for reconstructing archaeological phylogenies: Palaeoindian points from the southeastern United States*. Journal of Archaeological Science 28(10):1115–1136. <https://doi.org/10.1006/jasc.2001.0681>  
Applies parsimony cladistics to Paleoindian projectile points coded as discrete character states. Homoplasy is quantified, and the resulting trees are treated as testable hypotheses of descent.  
→ *Implication for Vestigium:* Any lineage claim needs explicitly coded characters, a rationale for polarity or outgroup, and homoplasy statistics. Trees built from embedding distances are not phylogenies.

**[temkin2007_material_phylogenetics]** Tëmkin I, Eldredge N (2007). *Phylogenetics and material cultural evolution*. Current Anthropology 48(1):146–154. <https://doi.org/10.1086/510463>  
Compares the evolution of designed artefacts (musical-instrument case studies) with biological phylogenetics. Horizontal transfer, blending and deliberate design break the assumptions of branching-tree models, so tree reconstructions of material culture need caution and alternative representations.  
→ *Implication for Vestigium:* Instrument designs spread through makers, trade catalogs and copying (reticulation). Represent relationships as networks anchored in documented maker and designer links, such as the Boerhaave designer–maker tables, not as similarity trees.

**[obrien2018_convergence]** O'Brien MJ, Buchanan B, Eren MI (eds.) (2018). *Convergent Evolution in Stone-Tool Technology*. MIT Press (Vienna Series in Theoretical Biology). <https://doi.org/10.7551/mitpress/11554.001.0001>  
An edited volume showing that similar stone-tool forms often arise independently under shared functional and material (fracture-mechanics) constraints. Replication experiments and phylogenetic methods are used to judge how likely convergence is.  
→ *Implication for Vestigium:* Strong functional constraints (e.g. gripping needs opposed jaws and a pivot) predict convergent form. Roman–modern similarity is expected from function alone and is not evidence of descent unless independent historical evidence supports it.


### H. Surgical instruments: datasets and history

**[rodrigues2022_tool_datasets]** Rodrigues M, Mayo M, Patros P (2022). *Surgical tool datasets for machine learning research: A survey*. International Journal of Computer Vision 130(9):2222–2248. <https://doi.org/10.1007/s11263-022-01640-6>  
A survey of surgical-tool datasets, tasks (detection, segmentation, tracking), metrics and deep-learning methods, with a taxonomy of approaches. The data are dominated by endoscopic and laparoscopic video.  
→ *Implication for Vestigium:* Few public datasets show isolated instruments in catalog-like views. Modern links rest on small tray or catalog sets, so their sizes and photographic domains must be reported.

**[lavado2018_labeled_surgical_tools]** Lavado D, da Silva J, Caramelo F (2018). *Labeled Surgical Tools and Images [dataset]*. Kaggle (University of Coimbra MSc project); ODbL v1.0 per Dataset Ninja mirror. <https://www.kaggle.com/datasets/dilavado/labeled-surgical-tools>  
About 2,620 images with 3,639 boxes (one listing says 3,009 images) of four classes: scalpel no. 4, straight dissection clamp, and straight and curved Mayo scissors. Tools lie on a cluttered tray under varied rotation, tilt and lighting, with occlusion flags.  
→ *Implication for Vestigium:* A small modern reference set for checking whether embeddings place modern scissors and clamps near historical cutting and gripping instruments. The tray background is itself a domain confound.

**[atabuzzaman2025_ultrafine]** Atabuzzaman M, DiMatteo G, Alomari H, Tang C, Hale C, Goode AE, King DR, Thomas C (2025). *Real-time ultra-fine-grained surgical instrument classification*. Proc. IEEE/CVF CVPR Workshops, 2070–2079. <https://doi.org/10.1109/CVPRW67362.2025.00195>  
Multi-view CNN and transformer models classify 95 instrument classes from three standard trays in a hospital sterile-services setting, followed by a post-deployment user study.  
→ *Implication for Vestigium:* Near-identical modern variants need multiple controlled views. With single catalog thumbnails, report modern–historical matches at family level, not exact model.

**[twinanda2017_endonet]** Twinanda AP, Shehata S, Mutter D, Marescaux J, de Mathelin M, Padoy N (2017). *EndoNet: A deep architecture for recognition tasks on laparoscopic videos*. IEEE Transactions on Medical Imaging 36(1):86–97. <https://doi.org/10.1109/TMI.2016.2593957>  
A multi-task CNN for surgical phase recognition and tool presence in laparoscopic video, introducing Cholec80 (80 cholecystectomies; tool presence at 1 fps; CC BY-NC-SA 4.0). Related segmentation benchmark: EndoVis 2017 (Allan et al., arXiv:1902.06426).  
→ *Implication for Vestigium:* Contrast only. Instruments in use (tips, blur, tissue) look nothing like catalog photographs, so these data are unsuitable for function transfer. They do show what direct in-use evidence looks like.

**[bliquez2015_asclepius]** Bliquez LJ (2015). *The Tools of Asclepius: Surgical Instruments in Greek and Roman Times*. Brill, Studies in Ancient Medicine 43. <https://doi.org/10.1163/9789004283596>  
The standard modern reference on Greco-Roman surgical instruments, organised by period and instrument category and combining ancient texts with archaeological finds.  
→ *Implication for Vestigium:* An independent, non-image evidence channel for Roman instrument function, and a basis for adjudication rubrics. Its typology is expert input and must not be presented as a model discovery.


---

## 2. Synthesis: from literature to experiments and controls

### 2.1 What the literature implies about our claims

| Claim type | What it may rest on | What it may not rest on | Key sources |
|---|---|---|---|
| **Morphological similarity** (A looks like B) | Embedding or descriptor distance, with confounder controls (§2.2) | — | oquab2024_dinov2, bonhomme2014_momocs, musgrave2020_metric_reality |
| **Functional analogy** (A and B probably act the same way) | Matching working parts and mechanism (pivot, opposed jaws, edge, lever), plus textual or use evidence | Whole-image similarity alone; catalog wording that also serves as the label | zhu2015_understanding_tools, abelha2016_substitute_tools, myers2015_umd_affordance, zhang2024_luwa |
| **Historical relationship** (B derives from A, or both share a source) | Documentary evidence (makers, catalogs, provenance) and coded characters with homoplasy assessment, shown as a network | Any similarity, morphological or functional. Convergence under shared function is the null expectation. | obrien2018_convergence, temkin2007_material_phylogenetics, obrien2001_cladistics, okumura2019_gm_borrowing |

Similar form across Roman, ethnographic and modern instruments is the **expected** outcome of shared mechanical constraints (obrien2018_convergence). Similarity therefore ranks candidates for review; it never establishes lineage.

### 2.2 Controls to run before any representation result is shown

1. **Leakage-safe splits** (assael2025_aeneas, winterbottom2022_instances, barz2020_near_duplicates, kapoor2023_leakage):
   - Group by object and by known duplicate group.
   - Add near-duplicate detection across sources: perceptual hash plus a frozen DINOv2 cosine threshold. Record the threshold and review a sample of flagged pairs by hand.
   - Report metrics with and without near-duplicate pairs.
   - Complete a Kapoor–Narayanan model info sheet for each run.
   - For generalisation claims, also hold out entire instrument types, not only photos of types already seen (anwar2021_coins).
2. **Name That Museum probe** (torralba2011_dataset_bias, zech2018_hospital_confound):
   - Fit a linear probe that predicts source collection and photo campaign from each representation: TF-IDF, multilingual text, Fourier shape, ResNet18, DINOv2, SigLIP/OpenCLIP.
   - Report balanced accuracy against chance with grouped cross-validation.
   - Also report a *source-only* baseline for function labels. Any function score close to the source-only score is presumed shortcut-driven.
3. **Cross-source evaluation** (geirhos2020_shortcut, wortsman2022_wiseft): every retrieval or function metric is reported (a) within source and (b) leave-one-source-out. The cross-source number is the headline.
4. **Cue-suppression and background tests** (xiao2021_backgrounds, geirhos2019_texture with the Burgert 2025 counterpoint, toumarkine2025_beyond_accuracy, lapuschkin2019_cleverhans):
   - For each image model, compare neighbour sets across five input conditions: original, foreground-masked on a uniform background, silhouette-only, grayscale, and background-only.
   - Report top-k neighbour overlap between conditions and source purity of neighbours.
   - Cluster relevance maps to detect rulers, labels, mounts and colour cards.
5. **Text-label separation** (kapoor2023_leakage, assael2025_aeneas): if a function hypothesis comes from catalog text rules, it can be evaluated only on models that never see that text, i.e. image or shape models. Text-derived labels and text-based models stay a dependent evidence pair, and are reported as such.

### 2.3 Representation experiments, cheapest first

| # | Experiment | Baselines / comparison | Readout | Sources |
|---|---|---|---|---|
| R1 | Frozen DINOv2 (ViT-S/B) image retrieval on masked foregrounds | ResNet18 (current), Fourier shape, TF-IDF | MAP@R and recall@k on the adjudicated pilot pairs; neighbour source purity | oquab2024_dinov2, musgrave2020_metric_reality |
| R2 | Multilingual sentence embeddings for catalog text | TF-IDF | Cross-lingual retrieval test; source and language probe accuracy | reimers2020_multilingual |
| R3 | Representation agreement without ground truth | All embeddings, plus nuisance embeddings (source one-hot, photo statistics) | Linear CKA and k-NN overlap matrix | kornblith2019_cka |
| R4 | Part-aware working-end similarity (DINO patch-feature part co-segmentation, then compare working-end regions only) | Whole-image embedding | On expert-judged *functional* pairs, does working-end similarity beat whole-object similarity? | amir2022_vit_descriptors, myers2015_umd_affordance, abelha2016_substitute_tools |
| R5 | Zero-shot text–image function prompts with written label definitions (NL/SV/EN) | Neighbour-vote labels | Agreement with adjudicated labels; label-wise abstention rate; LAION contamination check for OpenCLIP | banar2023_iconclass, smits2023_multimodal, zhai2023_siglip, radford2021_clip, cherti2023_openclip |
| R6 | Small-data contrastive fine-tuning (sigmoid loss) after a linear probe; WiSE-FT interpolation | Frozen model; small from-scratch model | Cross-source performance only; seeds ≥3; CIs by grouped bootstrap | zhai2023_siglip, wortsman2022_wiseft, eleftheriadou2025_polish |
| R7 | 2-D/3-D consistency on a small stratified subset (multi-view or CT/photogrammetry where available) | Single-view silhouette | Rank stability of neighbours across views | bossema2024_ct, anichini2021_archaide |

### 2.4 Function hypotheses

- **Partial labels:** train and evaluate with unobserved labels treated as unknown, using partial-label losses with no assumed negatives. Report positives per label; crushing currently has zero supported positives and must stay at abstention (cole2021_single_positive).
- **Mechanism-anchored labels:** each of the eight functions gets written, multilingual definitions and mechanical criteria (e.g. *gripping* = opposed jaws + pivot or spring; *dilation* = divergent blades or tapered insertion). These definitions become retrieval targets and adjudication rubrics (banar2023_iconclass, zhu2015_understanding_tools, bliquez2015_asclepius). A function → mechanism → type hierarchy can be written into text supervision BioCLIP-style, but any learned hierarchy then reflects our labels, not discovery (stevens2024_bioclip).
- **Calibration:** keep vote fractions labelled as uncalibrated. When an adjudicated calibration set exists, use split-conformal label sets with per-source coverage checks (angelopoulos2023_conformal).
- **Ceiling:** catalog images cannot show use-wear, so a form-based function label is a hypothesis about affordance, not evidence of use (zhang2024_luwa, eleftheriadou2025_polish).

### 2.5 Human–AI evaluation design

- **Experts with and without suggestions** (assael2022_ithaca, assael2025_aeneas): randomised crossover on held-out items. Each expert judges some items unaided and others with model neighbours and evidence. Measure accuracy against adjudication, rated usefulness ("useful starting point", per Aeneas) and confidence change. Report expert–expert agreement as the ceiling (pawlowicz2021_ceramics).
- **Triage yield** (sakai2024_nazca): log, for each suggestion rank, how many suggestions were reviewed per accepted relation or label. Keep the existing non-AI channel (manual catalog linkage) as a comparator. Expect low precision and budget for it.
- **Presentation:** ranked candidates, per-label abstention, evidence links (neighbours, matched parts, source text), and attribution maps. No single "answer" (assael2022_ithaca).

### 2.6 Relationship and lineage claims

- Use a three-tier vocabulary on the website and in exports: *similar form*, *possible functional analogue*, *documented relationship*. Only the third may use words like lineage, derived or descended.
- **Convergence null:** for a given function, compare similarity between unrelated traditions (ethnographic vs Roman vs modern) with similarity within documented maker networks. If within-network similarity does not exceed the cross-tradition baseline, similarity carries no historical signal.
- Any tree uses explicitly coded discrete characters (definitions documented, not embedding coordinates), reports homoplasy indices, and is shown next to a network view that admits borrowing (obrien2001_cladistics, temkin2007_material_phylogenetics, okumura2019_gm_borrowing).

### 2.7 Modern surgical links

- Modern reference sets are small and domain-shifted: trays, smartphone photos, clutter (rodrigues2022_tool_datasets, lavado2018_labeled_surgical_tools). Report modern matches at instrument-*family* level only (atabuzzaman2025_ultrafine).
- Run the Name That Museum probe on the modern set as well, because a historical-to-modern match can simply mean 'clean studio photo'. Add a CC0 Rijksmuseum object sample as an out-of-collection control (mensink2014_rijksmuseum).
- Endoscopic datasets (Cholec80, EndoVis) are a contrast for in-use appearance, not a transfer source (twinanda2017_endonet).

---

## 3. Candidate external models and datasets

Licences were read from host pages on 2026-10-22. Recheck before use. For any redistribution of derived images or features, record the licence in the run manifest.

| Resource | Use in Vestigium | Licence note | URL |
|---|---|---|---|
| DINOv2 (ViT-S/B/L/g) | Frozen image backbone (R1, R3, R4) | Apache-2.0 for code and weights | https://github.com/facebookresearch/dinov2 |
| DINOv3 | Optional later comparison | Custom "DINOv3 License"; weights gated by request | https://github.com/facebookresearch/dinov3 |
| OpenCLIP | Open-data image–text baseline; contamination check against LAION | Code MIT; per-checkpoint weights and pretraining-data terms vary | https://github.com/mlfoundations/open_clip |
| SigLIP 2 (e.g. `google/siglip2-base-patch16-224`) | Multilingual image–text model; sigmoid-loss fine-tuning (R5, R6) | Apache-2.0 (model card) | https://huggingface.co/google/siglip2-base-patch16-224 |
| OpenAI CLIP | Historical baseline only (closed training data) | MIT (code and weights) | https://github.com/openai/CLIP |
| BioCLIP | Example of hierarchy-aware text supervision, not a direct backbone | MIT (model card) | https://huggingface.co/imageomics/bioclip |
| `paraphrase-multilingual-MiniLM-L12-v2` | Multilingual catalog-text embedding (R2); confirm NL/SV quality empirically | Apache-2.0; model card tags 50 languages | https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Momocs | Reference elliptic Fourier implementation for cross-checking the shape block | Open-source R package (CRAN) | https://doi.org/10.18637/jss.v056.i13 |
| UMD RGB-D Part Affordance dataset | Part-affordance cues (cut, grasp, pound, scoop); transfer test only | No explicit licence on project page; cite Myers et al. 2015 and contact authors | https://users.umiacs.umd.edu/~fer/affordance/part-affordance-dataset/index.html |
| LUWA | Reference for use-wear-based function evidence; not directly transferable | No licence listed on HF or GitHub; ask authors | https://huggingface.co/datasets/ai4ce/LUWA |
| Labeled Surgical Tools and Images (Lavado et al. 2018) | Small modern reference set (4 classes) | ODbL v1.0 (per Dataset Ninja mirror; confirm on Kaggle) | https://www.kaggle.com/datasets/dilavado/labeled-surgical-tools |
| Mendeley "SURGICAL TOOLS" (Reddy, 2025) | Modern reference, 9 classes, about 6,000 smartphone images, varied backgrounds | CC BY-ND 4.0: no redistribution of derivatives; evaluation only | https://doi.org/10.17632/cyghvmjrt3.1 |
| Cholec80 | Contrast only (in-use endoscopic appearance) | CC BY-NC-SA 4.0 (CAMMA) | https://camma.unistra.fr/datasets/ |
| Rijksmuseum open data | Dutch out-of-collection control images and metadata (type, material, date) | CC0 for public-domain objects; per-object rights in metadata | https://www.rijksmuseum.nl/en/data/policy |

**Gap noted.** We found no peer-reviewed computational study of the typology or lineage of historical *surgical* instruments, including obstetric forceps. Searches for 'phylogenetic analysis obstetric forceps' and 'historical surgical instruments museum machine learning' returned no such work. Vestigium would be early here, which is one more reason to keep relationship claims conservative and documentary.
