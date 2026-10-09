---
title: rawtherapee-photo-skills
description: 打包成一个可安装技能包的 AI 摄影后期工具集，三个模块共用一个 config.toml，以 RawTherapee CLI 作为调色引擎。
date: '2026-09-16'
updated: '2026-10-05'
tags:
  - Python
  - RawTherapee
  - 摄影后期
  - 批处理
  - RAW
githubUrl: https://github.com/MrC-Sinclair/rawtherapee-photo-skills
featured: true
---

## 项目简介

把摄影后期这条链路做成 AI 可以直接调用的整套技能：从 RAW 转码、按拍摄日期筛选、批量调色，到浏览器里对比预览，全部由一个根 `config.toml` 统一配置，以 **RawTherapee CLI** 作为调色引擎。

它不是单个脚本，而是三个互相衔接的模块，可以只用其中一部分，也可以串起来跑完整条流水线。

## 三个模块

- **photo-toolkit**（`convert.py` / `find_by_date.py` / `layout_preview.py` / `deflicker.py` / `assemble.py` / `file_matcher.py`）
  批量把 RAW / JPG / HEIC 转成 JPG 缩略图、按拍摄日期查找与筛选照片、识别延时摄影序列、去除帧间闪烁、把帧序列合成 MP4、生成前后对比图或宫格预览。

- **photo-grader**（`grade.py`）
  由 LLM 生成 JSON 调色参数（曝光、对比度、HSL、色调曲线等），做 Lightroom 风格的批量调色，输出调色后的 JPG，或 RawTherapee 的 `.pp3` 侧车文件——后者意味着调色结果仍然是非破坏性的，随时能在 RawTherapee 里继续手动微调。

- **photo-previewer**（`preview.py`）
  起一个本地服务做交互式浏览器预览：调色前后网格切换、按调色风格分标签页、支持移动端手势，且零额外依赖。

## 流水线

```text
RAW / JPG / HEIC
    │
    ▼  photo-toolkit/scripts/convert.py        → JPG 缩略图
    ▼  [LLM 生成 grading_params.json]
    ▼  photo-grader/scripts/grade.py           → 调色后 JPG / PP3（RawTherapee）
    ├──▶ photo-toolkit/scripts/layout_preview.py  → 静态前后对比或宫格
    └──▶ photo-previewer/scripts/preview.py       → 浏览器交互预览
```

## 技术特点

- **一份配置管三个模块**：共用一个根 `config.toml`，本机路径（Windows 上外部 CLI 通常不在 PATH 里）只填一次
- **非破坏性调色**：导出 `.pp3` 侧车文件时保留原始 RAW，参数随时可改
- **HEIC 的补齐**：RawTherapee 5.13 自己解不了 HEIC，由 `pillow-heif` 先转 TIFF 再交给它；10/12 位 HEIC 用 `tifffile` 保持位深，不退化到 8 位
- **RAW 解码统一走 rawpy**：`convert.py` 每次解码都用 rawpy，不是可选路径，避免不同格式走不同分支产生色差
- **依赖按需**：RawTherapee CLI 只有 `grade.py` 需要，FFmpeg 只有 `assemble.py` 需要，其余模块装了 Python 依赖就能跑
- **格式覆盖广**：尼康 NEF/NRW、佳能 CR2/CR3/CRW、索尼 ARW、富士 RAF、奥之心 ORF、松下 RW2、宾得 PEF、Adobe DNG、哈苏 3FR/FFF 等主流 RAW，加上 JPEG 与 Apple HEIC/HEIF

## 实现亮点

1. 三个模块按「谁更适合」分工，而不是重复实现同一件事——转码与筛选交给 toolkit，调色交给 grader，人眼确认交给 previewer
2. 调色参数由 LLM 产出 JSON，把「描述想要的风格」和「具体怎么调」解耦，人不用手填十几项参数
3. 侧车文件方案让 AI 的批量调色结果仍然能被专业软件接手，AI 产出不是终点而是中间产物
4. 模块间用 `sys.path` 从兄弟目录解析共享脚本（`photo-grader` 复用 `photo-toolkit` 的 `file_matcher.py`），所以三个目录必须放在一起

## 上游与许可

合并并重打包自 [konanok/photo-skills](https://github.com/konanok/photo-skills)（三个模块均来自该项目，MIT-0 许可），本仓库沿用相同许可条款。RawTherapee 是独立项目，这里仅作为外部命令行调用。
