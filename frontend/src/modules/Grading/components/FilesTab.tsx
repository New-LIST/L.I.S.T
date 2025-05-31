import React, { useEffect, useState } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../../../services/api";
import EmptyState from "../../../shared/components/EmptyState";

interface FilesTabProps {
  assignmentId: number;
  solutionId: number;
}

interface VersionItem {
  version: number;
  comment?: string | null;
}

const FilesTab: React.FC<FilesTabProps> = ({ assignmentId, solutionId }) => {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [version, setVersion] = useState<number | null>(null);

  const [files, setFiles] = useState<string[]>([]);
  const [file, setFile] = useState<string>("");

  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState({
    versions: false,
    files: false,
    code: false,
  });

  const [fileURL, setFileURL] = useState<string>("");

  const rawUrl = `/solutions/${solutionId}/versions/${version}/files/${encodeURIComponent(
    file
  )}`;

  useEffect(() => {
    setLoading((l) => ({ ...l, versions: true }));
    api
      .get<VersionItem[]>(
        `/solutions/${solutionId}/versions`
      )
      .then((res) => {
        setVersions(res.data);
        if (res.data.length > 0) {
          setVersion(res.data[0].version);
        }
      })
      .catch(console.error)
      .finally(() => setLoading((l) => ({ ...l, versions: false })));
  }, [assignmentId, solutionId]);

  useEffect(() => {
    if (version == null) return;
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      setFileURL("");
    }
    setFile("");
    setLoading((l) => ({ ...l, files: true }));

    api
      .get<string[]>(
        `/solutions/${solutionId}/versions/${version}/files`
      )
      .then((res) => {
        setFiles(res.data);
        if (res.data.length) {
          setFile(res.data[0]);
        } else {
          setFile("");
        }
      })
      .catch((err) => {
        console.error(err);
        setFiles([]);
        setFile("");
      })
      .finally(() => setLoading((l) => ({ ...l, files: false })));
  }, [assignmentId, solutionId, version]);

  useEffect(() => {
    if (version == null || !file) return;

    // Najprv vymažeme predchádzajúce fileURL (ak nejaké bolo) a kód:
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      setFileURL("");
    }
    setCode("");

    const ext = file.split(".").pop()?.toLowerCase();
    console.log("Prípona súboru:", ext);

    // 1) Ak je to kód (textový formát), spravíme GET text/plain ako doteraz:
    if (isCode) {
      setLoading((l) => ({ ...l, code: true }));
      api
        .get<string>(rawUrl, { responseType: "text" })
        .then((r) => setCode(r.data))
        .catch(console.error)
        .finally(() => setLoading((l) => ({ ...l, code: false })));
      return;
    }

    // 2) Ak je to binárny súbor (obrázok, PDF, audio, video), stiahneme ho ako blob:
    if (isImage || isPDF || isAudio || isVideo) {
      // Označíme loading kódu, aby sa vedelo, že sa niečo načítava
      setLoading((l) => ({ ...l, code: true }));

      api
        .get(rawUrl, { responseType: "blob" })
        .then((response) => {
          // Vytvoríme URL z blob-u
          const blob = response.data as Blob;
          const url = URL.createObjectURL(blob);
          setFileURL(url);
        })
        .catch((err) => {
          console.error("Chyba pri načítaní binárneho súboru:", err);
          setFileURL("");
        })
        .finally(() => setLoading((l) => ({ ...l, code: false })));

      return;
    }
  }, [file, rawUrl, version]);

  if (!loading.versions && versions.length === 0) {
    return <EmptyState message="Študent neodovzdal žiadne súbory" />;
  }

  const currentComment = versions.find((v) => v.version === version)?.comment;

  const ext = file.split(".").pop()?.toLowerCase();

  const isCode = [
    "txt",
    "json",
    "csv",
    "cpp",
    "js",
    "ts",
    "java",
    "py",
    "cs",
    "asm",
    "c",
    "class",
    "h",
    "xml",
    "jar",
    "jsx",
    "tsx",
  ].includes(ext!);
  const isImage = ["png", "jpg", "jpeg", "gif", "bmp", "svg"].includes(ext!);
  const isPDF = ext === "pdf";
  const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(ext!);
  const isVideo = ["mp4", "webm", "ogg"].includes(ext!);

  return (
    <Box p={2}>
      <Grid container spacing={1}>
        {/* version select */}

        <Grid size={4}>
          <Stack spacing={1}>
            <FormControl size="small">
              <InputLabel>Verzia</InputLabel>
              <Select
                value={version ?? ""}
                label="Verzia"
                onChange={(e) => {
                  setVersion(Number(e.target.value));
                  setFile("");
                }}
              >
                {loading.versions ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  versions.map((v) => (
                    <MenuItem key={v.version} value={v.version}>
                      {v.version}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* file select */}
            <FormControl fullWidth size="small">
              <InputLabel>Súbor</InputLabel>
              <Select
                value={file}
                label="Súbor"
                onChange={(e) => setFile(e.target.value as string)}
              >
                {loading.files ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  files.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        {/* comment display */}
        <Grid size={8}>
          <TextField
            label="Komentár k verzii"
            value={
              currentComment
                ? currentComment
                : "Študent nepridal žiadny komentár"
            }
            fullWidth
            size="small"
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* code viewer */}
        <Grid size={12}>
          <Paper
            sx={{ p: 1, height: 500, overflow: "auto" }}
          >
            {isImage && !loading.files && (
              <Box textAlign="center">
                {loading.code ? (
                  <CircularProgress />
                ) : fileURL ? (
                  <img
                    src={fileURL}
                    alt={file}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (
                  <EmptyState message="Nepodarilo sa načítať obrázok." />
                )}
              </Box>
            )}

            {isPDF && !loading.files && (
              <Box textAlign="center">
                {loading.code ? (
                  <CircularProgress />
                ) : fileURL ? (
                  <Button
                    variant="contained"
                    onClick={() => window.open(fileURL, "_blank")}
                  >
                    Otvoriť PDF v novom okne
                  </Button>
                ) : (
                  <EmptyState message="Nepodarilo sa načítať PDF." />
                )}
              </Box>
            )}

            {isAudio && !loading.files && (
              <Box textAlign="center">
                {loading.code ? (
                  <CircularProgress />
                ) : fileURL ? (
                  <audio controls style={{ width: "100%" }}>
                    <source src={fileURL} />
                    Váš prehliadač nepodporuje audio.
                  </audio>
                ) : (
                  <EmptyState message="Nepodarilo sa načítať audio." />
                )}
              </Box>
            )}

            {isVideo && !loading.files && (
              <Box textAlign="center">
                {loading.code ? (
                  <CircularProgress />
                ) : fileURL ? (
                  <video
                    controls
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  >
                    <source src={fileURL} />
                    Váš prehliadač nepodporuje video.
                  </video>
                ) : (
                  <EmptyState message="Nepodarilo sa načítať video." />
                )}
              </Box>
            )}

            {isCode &&
              (loading.code ? (
                <Box textAlign="center">
                  <CircularProgress />
                </Box>
              ) : (
                <SyntaxHighlighter
                  language={ext}
                  style={materialLight}
                  showLineNumbers
                  wrapLongLines={true}
                  lineProps={{ style: { whiteSpace: "pre-wrap" } }}
                >
                  {code}
                </SyntaxHighlighter>
              ))}

            {!isImage && !isPDF && !isAudio && !isVideo && !isCode && (
              <EmptyState message="Tento formát nedokážeme zobraziť." />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilesTab;
