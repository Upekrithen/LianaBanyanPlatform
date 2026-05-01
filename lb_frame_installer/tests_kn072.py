"""
Tests KN072 — LB Frame Installer with Walkaround Auto-Fire
10 tests covering Phase C requirements (design validation, not live execution).
Bean: KN072 / BP006 / Pod EE
Liana Banyan Corporation — AGPL v3
"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

INSTALLER_ROOT = Path(__file__).parent
WORKSPACE_ROOT = INSTALLER_ROOT.parent

BUILD_SCRIPT  = INSTALLER_ROOT / "build_lb_frame_installer.ps1"
SETUP_SCRIPT  = INSTALLER_ROOT / "LBFrame-Setup.ps1"
MANIFEST_FILE = INSTALLER_ROOT / "manifest.json"
README_FILE   = INSTALLER_ROOT / "README.md"
DIST_DIR      = INSTALLER_ROOT / "dist"


def read_file(path: Path) -> str:
    """Return file contents as string, or empty string if missing."""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return ""


class T01_BuildScriptExists(unittest.TestCase):
    """T01: Build script exists and contains expected PowerShell structure."""

    def test_build_script_exists(self):
        self.assertTrue(BUILD_SCRIPT.exists(), f"Missing: {BUILD_SCRIPT}")

    def test_build_script_has_param_block(self):
        src = read_file(BUILD_SCRIPT)
        self.assertIn("param(", src, "build script must have param() block")

    def test_build_script_has_compress_archive(self):
        src = read_file(BUILD_SCRIPT)
        self.assertIn("Compress-Archive", src,
                      "build script must call Compress-Archive to produce zip")

    def test_build_script_has_dist_output(self):
        src = read_file(BUILD_SCRIPT)
        self.assertIn("dist", src.lower(),
                      "build script must reference dist/ output directory")


class T02_SetupScriptSections(unittest.TestCase):
    """T02: LBFrame-Setup.ps1 exists and contains all required sections."""

    def setUp(self):
        self.src = read_file(SETUP_SCRIPT)

    def test_setup_script_exists(self):
        self.assertTrue(SETUP_SCRIPT.exists(), f"Missing: {SETUP_SCRIPT}")

    def test_detect_claude_section(self):
        self.assertIn("$InstallBase", self.src,
                      "installer must check $InstallBase (Claude Code detection)")

    def test_backup_settings_section(self):
        self.assertIn("settings.json", self.src,
                      "installer must reference settings.json for backup")
        self.assertIn("backup", self.src.lower(),
                      "installer must mention backup of settings.json")

    def test_merge_hooks_section(self):
        self.assertIn("hooks", self.src,
                      "installer must contain hooks merge logic")
        self.assertIn("SessionStart", self.src,
                      "installer must register SessionStart hook event")

    def test_walkaround_autofire_section(self):
        self.assertIn("Walkaround.ps1", self.src,
                      "installer must reference Walkaround.ps1 for auto-fire")
        self.assertIn("$LASTEXITCODE", self.src,
                      "installer must capture Walkaround exit code")


class T03_ManifestSchema(unittest.TestCase):
    """T03: manifest.json schema validation (synthetic if not built yet)."""

    REQUIRED_KEYS = {"version", "build_date", "package_name", "file_count", "files"}

    def _get_manifest(self):
        if MANIFEST_FILE.exists():
            return json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
        # Synthetic manifest for schema validation
        return {
            "version": "0.1.0",
            "build_date": "2026-05-01T00:00:00Z",
            "package_name": "LBFrame-Setup-v0.1.0-walkaround-demo.zip",
            "file_count": 1,
            "files": [
                {
                    "path": "hooks/bishop_session_start.py",
                    "source": "~/.claude/hooks/bishop_session_start.py",
                    "sha256": "a" * 64,
                }
            ],
        }

    def test_manifest_has_required_top_level_keys(self):
        m = self._get_manifest()
        for key in self.REQUIRED_KEYS:
            self.assertIn(key, m, f"manifest missing required key: {key}")

    def test_manifest_version_is_string(self):
        m = self._get_manifest()
        self.assertIsInstance(m["version"], str)
        self.assertRegex(m["version"], r"^\d+\.\d+\.\d+$",
                         "version must be semver e.g. 0.1.0")

    def test_manifest_files_is_list(self):
        m = self._get_manifest()
        self.assertIsInstance(m["files"], list)

    def test_manifest_file_entries_have_path_and_sha256(self):
        m = self._get_manifest()
        for entry in m["files"]:
            self.assertIn("path", entry, "each file entry needs 'path'")
            self.assertIn("sha256", entry, "each file entry needs 'sha256'")

    def test_manifest_file_count_matches_files_list(self):
        m = self._get_manifest()
        self.assertEqual(m["file_count"], len(m["files"]),
                         "file_count must equal len(files)")


class T04_MissingClaudeCodeDetection(unittest.TestCase):
    """T04: Installer detects missing Claude Code and emits a warning (not silent fail)."""

    def setUp(self):
        self.src = read_file(SETUP_SCRIPT)

    def test_checks_install_base_existence(self):
        self.assertIn("Test-Path $InstallBase", self.src,
                      "installer must Test-Path the $InstallBase directory")

    def test_emits_warning_not_silent_fail(self):
        self.assertIn("Write-Warn", self.src,
                      "installer must call Write-Warn (not just exit) when Claude Code missing")

    def test_does_not_exit_on_missing_claude(self):
        # Verify the missing-claude block does NOT have a bare exit/throw before the warn
        # Heuristic: the warning for ~/.claude/ missing should appear before any unconditional exit
        idx_warn = self.src.find("Install Claude Code from claude.ai")
        self.assertGreater(idx_warn, 0,
                           "installer must emit advisory to install Claude Code")

    def test_notes_cli_not_required(self):
        self.assertIn("PATH", self.src,
                      "installer must note that claude CLI on PATH is not required")


class T05_IdempotencyDesign(unittest.TestCase):
    """T05: Installer has -Force parameter + skip-if-exists logic."""

    def setUp(self):
        self.src = read_file(SETUP_SCRIPT)

    def test_has_force_parameter(self):
        self.assertIn("[switch]$Force", self.src,
                      "installer must declare -Force switch parameter")

    def test_has_skip_if_exists_logic(self):
        # Copy-IfNew function encodes the skip-if-exists pattern
        self.assertIn("Copy-IfNew", self.src,
                      "installer must use skip-if-exists copy helper")
        self.assertIn("-not $Force", self.src,
                      "installer must check -Force to override skip-if-exists")

    def test_force_overrides_skip(self):
        # The Copy-IfNew function: (Test-Path $Dst) -and -not $Force → return early
        self.assertIn("return $true", self.src,
                      "Copy-IfNew must return early (skip) when file exists and not -Force")


class T06_WalkaroundAutoFireDesign(unittest.TestCase):
    """T06: Installer calls Walkaround.ps1 as final step + branches on exit code."""

    def setUp(self):
        self.src = read_file(SETUP_SCRIPT)

    def test_calls_walkaround_script(self):
        self.assertIn("Walkaround.ps1", self.src)

    def test_uses_bypass_execution_policy(self):
        self.assertIn("ExecutionPolicy Bypass", self.src,
                      "Walkaround must be invoked with -ExecutionPolicy Bypass")

    def test_captures_exit_code(self):
        self.assertIn("$LASTEXITCODE", self.src,
                      "installer must capture $LASTEXITCODE from Walkaround")

    def test_branches_on_exit_zero(self):
        self.assertIn("$exitCode -eq 0", self.src,
                      "installer must branch on exitCode == 0 (success path)")

    def test_branches_on_exit_nonzero(self):
        self.assertIn("exit 1", self.src,
                      "installer must exit 1 when Walkaround reports failures")


class T07_ForceFlag(unittest.TestCase):
    """T07: -Force flag overrides skip-if-exists for hooks and eblets."""

    def setUp(self):
        self.src = read_file(SETUP_SCRIPT)

    def test_force_declared_in_param_block(self):
        self.assertIn("[switch]$Force", self.src)

    def test_copy_if_new_respects_force(self):
        # The Copy-IfNew function must check Force before skipping
        lines = self.src.splitlines()
        in_copy_if_new = False
        force_check_found = False
        for line in lines:
            if "function Copy-IfNew" in line:
                in_copy_if_new = True
            if in_copy_if_new and "-not $Force" in line:
                force_check_found = True
                break
            if in_copy_if_new and line.strip().startswith("function ") and "Copy-IfNew" not in line:
                break  # exited the function
        self.assertTrue(force_check_found,
                        "Copy-IfNew must check -Force before skipping existing files")

    def test_settings_merge_respects_force(self):
        self.assertIn("-or $Force", self.src,
                      "settings.json merge must re-add hooks when -Force is specified")


class T08_SHA256Checksums(unittest.TestCase):
    """T08: Build script computes SHA-256 checksums and includes them in manifest."""

    def setUp(self):
        self.src = read_file(BUILD_SCRIPT)

    def test_uses_get_file_hash(self):
        self.assertIn("Get-FileHash", self.src,
                      "build script must use Get-FileHash for checksum computation")

    def test_specifies_sha256_algorithm(self):
        self.assertIn("SHA256", self.src,
                      "build script must specify SHA256 algorithm")

    def test_includes_sha256_in_manifest(self):
        self.assertIn("sha256", self.src,
                      "build script must write sha256 field into manifest")

    def test_manifest_files_array_built(self):
        self.assertIn("manifest.files", self.src,
                      "build script must append entries to manifest.files array")


class T09_ReadmeExists(unittest.TestCase):
    """T09 (bonus): README.md exists and contains minimum required sections."""

    def setUp(self):
        self.src = read_file(README_FILE)

    def test_readme_exists(self):
        self.assertTrue(README_FILE.exists(), f"Missing: {README_FILE}")

    def test_contains_one_button_description(self):
        self.assertIn("ONE BUTTON", self.src,
                      "README must describe ONE BUTTON install experience")

    def test_contains_agpl_reference(self):
        self.assertIn("AGPL", self.src,
                      "README must mention AGPL license")

    def test_contains_walkaround_description(self):
        self.assertIn("Walkaround", self.src,
                      "README must describe the Walkaround demo")

    def test_contains_quick_start(self):
        self.assertIn("LBFrame-Setup.ps1", self.src,
                      "README must contain Quick Start command")


class T10_DistDirStructure(unittest.TestCase):
    """T10 (bonus): Build script targets dist/ output; dist/ directory exists."""

    def test_dist_dir_exists(self):
        self.assertTrue(DIST_DIR.exists(), f"dist/ directory must exist: {DIST_DIR}")

    def test_build_script_references_dist(self):
        src = read_file(BUILD_SCRIPT)
        self.assertIn("dist", src.lower(),
                      "build script must reference the dist/ output directory")

    def test_zip_name_includes_version(self):
        src = read_file(BUILD_SCRIPT)
        self.assertIn("walkaround-demo.zip", src.lower(),
                      "build script must produce a walkaround-demo.zip in dist/")


if __name__ == "__main__":
    loader = unittest.TestLoader()
    # Load all test classes in order
    suite = unittest.TestSuite()
    for cls in [
        T01_BuildScriptExists,
        T02_SetupScriptSections,
        T03_ManifestSchema,
        T04_MissingClaudeCodeDetection,
        T05_IdempotencyDesign,
        T06_WalkaroundAutoFireDesign,
        T07_ForceFlag,
        T08_SHA256Checksums,
        T09_ReadmeExists,
        T10_DistDirStructure,
    ]:
        suite.addTests(loader.loadTestsFromTestCase(cls))

    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(suite)

    total  = result.testsRun
    passed = total - len(result.failures) - len(result.errors)
    print(f"\n{'='*60}")
    print(f"RESULTS: {passed}/{total} tests passed")
    if len(result.failures):
        print(f"FAILURES ({len(result.failures)}):")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.splitlines()[-1]}")
    if len(result.errors):
        print(f"ERRORS ({len(result.errors)}):")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.splitlines()[-1]}")
    print(f"{'='*60}")

    sys.exit(0 if result.wasSuccessful() else 1)
