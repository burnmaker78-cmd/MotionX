
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Plus,
  FolderOpen,
  Film,
  Settings2,
  ChevronLeft,
  Play,
  MoreHorizontal,
  Music2,
  ImagePlus,
  Video,
  AudioLines,
  Sparkles,
  SlidersHorizontal,
  Crop,
  Layers,
  Clock3,
  X,
  Check,
  Copy,
  Gauge,
  WandSparkles,
} from "lucide-react-native";

type MediaClip = {
  id: string;
  uri: string;
  name: string;
  kind: "video" | "image";
  duration: number;
  fit: "fit" | "fill";
};

type Project = {
  id: string;
  name: string;
  ratio: string;
  fps: number;
  quality: number;
  clips: MediaClip[];
};

const BG = "#090a0f";
const PANEL = "#12141d";
const PANEL2 = "#1a1d29";
const ACCENT = "#a78bfa";
const MUTED = "#9295a7";
const BORDER = "#292c3b";

const ratios = [
  { label: "Square", ratio: "1:1", width: 46, height: 46 },
  { label: "Landscape", ratio: "16:9", width: 66, height: 38 },
  { label: "Portrait", ratio: "9:16", width: 34, height: 60 },
];

function ActionButton({
  title,
  onPress,
  icon,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, secondary && styles.secondaryButton]}
    >
      {icon}
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}

function VideoPreview({
  clip,
  ratio,
}: {
  clip?: MediaClip;
  ratio: string;
}) {
  const player = useVideoPlayer(
    clip?.kind === "video" ? clip.uri : null,
    (p) => {
      p.loop = true;
    }
  );

  React.useEffect(() => {
    if (clip?.kind === "video") {
      player.replace(clip.uri);
    }
  }, [clip?.uri]);

  const aspect =
    ratio === "1:1" ? 1 : ratio === "16:9" ? 16 / 9 : 9 / 16;

  return (
    <View style={styles.previewOuter}>
      <View
        style={[
          styles.preview,
          {
            aspectRatio: aspect,
            maxHeight: 330,
            maxWidth: ratio === "9:16" ? 210 : 520,
            width: "100%",
          },
        ]}
      >
        {!clip ? (
          <View style={styles.emptyPreview}>
            <View style={styles.previewIcon}>
              <Film size={30} color={ACCENT} />
            </View>
            <Text style={styles.previewTitle}>your composition</Text>
            <Text style={styles.muted}>
              add media to start editing
            </Text>
          </View>
        ) : clip.kind === "image" ? (
          <Image
            source={{ uri: clip.uri }}
            resizeMode={clip.fit === "fill" ? "cover" : "contain"}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit={clip.fit === "fill" ? "cover" : "contain"}
            nativeControls
          />
        )}
      </View>
    </View>
  );
}

export default function MotionX() {
  const [screen, setScreen] = useState<"home" | "setup" | "editor">("home");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("my project");
  const [ratio, setRatio] = useState("9:16");
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(1080);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<
    "none" | "media" | "effects" | "audio" | "settings"
  >("none");

  const activeProject = projects.find((p) => p.id === activeId);

  function updateProject(changes: Partial<Project>) {
    if (!activeId) return;
    setProjects((old) =>
      old.map((p) => (p.id === activeId ? { ...p, ...changes } : p))
    );
  }

  function createProject() {
    const project: Project = {
      id: Date.now().toString(),
      name: projectName.trim() || "untitled project",
      ratio,
      fps,
      quality,
      clips: [],
    };
    setProjects((old) => [project, ...old]);
    setActiveId(project.id);
    setSelectedClip(null);
    setPanel("none");
    setScreen("editor");
  }

  function openProject(project: Project) {
    setActiveId(project.id);
    setRatio(project.ratio);
    setFps(project.fps);
    setQuality(project.quality);
    setSelectedClip(null);
    setPanel("none");
    setScreen("editor");
  }

  async function addMedia() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled || !activeProject) return;

      const added: MediaClip[] = result.assets.map((asset, i) => ({
        id: `${Date.now()}-${i}`,
        uri: asset.uri,
        name: asset.fileName || `clip ${activeProject.clips.length + i + 1}`,
        kind: asset.type === "video" ? "video" : "image",
        duration: asset.duration ? asset.duration / 1000 : 5,
        fit: "fit",
      }));

      updateProject({ clips: [...activeProject.clips, ...added] });
      setSelectedClip(added[0]?.id || null);
      setPanel("none");
    } catch {
      Alert.alert(
        "couldn't open media",
        "please try opening your photos and videos again."
      );
    }
  }

  const currentClip = activeProject?.clips.find(
    (clip) => clip.id === selectedClip
  );

  function updateClip(id: string, changes: Partial<MediaClip>) {
    if (!activeProject) return;
    updateProject({
      clips: activeProject.clips.map((c) =>
        c.id === id ? { ...c, ...changes } : c
      ),
    });
  }

  function extractAudio() {
    Alert.alert(
      "audio extraction",
      "the audio extraction interface is ready to connect. actual extraction needs a native media-processing module before it can create a playable audio file."
    );
    setMenuOpen(false);
  }

  function deleteClip() {
    if (!activeProject || !selectedClip) return;
    updateProject({
      clips: activeProject.clips.filter((c) => c.id !== selectedClip),
    });
    setSelectedClip(null);
    setMenuOpen(false);
  }

  function goHome() {
    setScreen("home");
    setPanel("none");
    setMenuOpen(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {screen === "home" && (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Film size={23} color={ACCENT} />
              </View>
              <View>
                <Text style={styles.brand}>motionx</Text>
                <Text style={styles.muted}>video studio</Text>
              </View>
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => Alert.alert("settings", "more settings coming soon")}
            >
              <Settings2 color="#fff" size={21} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.homeContent}>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>YOUR CREATIVE SPACE</Text>
              <Text style={styles.heroTitle}>make something{"\n"}unreal.</Text>
              <Text style={styles.muted}>
                your edits, your style, your timeline.
              </Text>
              <Pressable
                style={styles.createButton}
                onPress={() => {
                  setProjectName("my project");
                  setRatio("9:16");
                  setFps(30);
                  setQuality(1080);
                  setScreen("setup");
                }}
              >
                <Plus color="#0b0b10" size={21} strokeWidth={3} />
                <Text style={styles.createButtonText}>new project</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>recent projects</Text>
              <Text style={styles.muted}>{projects.length} projects</Text>
            </View>

            {projects.length === 0 ? (
              <View style={styles.emptyProjects}>
                <FolderOpen color={MUTED} size={35} />
                <Text style={styles.emptyTitle}>nothing here yet</Text>
                <Text style={styles.muted}>
                  create your first project to get started.
                </Text>
              </View>
            ) : (
              projects.map((project) => (
                <Pressable
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => openProject(project)}
                >
                  <View style={styles.projectThumbnail}>
                    <Film color={ACCENT} size={27} />
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.muted}>
                      {project.ratio} · {project.fps} fps · {project.quality}p
                    </Text>
                    <Text style={styles.muted}>
                      {project.clips.length} clips
                    </Text>
                  </View>
                  <ChevronLeft
                    color={MUTED}
                    size={19}
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </Pressable>
              ))
            )}
          </ScrollView>
          <Text style={styles.footer}>MOTIONX STUDIO · CREATE WITHOUT LIMITS</Text>
        </View>
      )}

      {screen === "setup" && (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={goHome} style={styles.backButton}>
              <ChevronLeft color="#fff" size={23} />
            </Pressable>
            <Text style={styles.topTitle}>new project</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.setupContent}>
            <Text style={styles.heroTitle}>set your{"\n"}canvas.</Text>
            <Text style={styles.muted}>
              choose your format before you start editing.
            </Text>

            <Text style={styles.fieldLabel}>PROJECT NAME</Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="name your project"
              placeholderTextColor={MUTED}
              style={styles.nameInput}
            />

            <Text style={styles.fieldLabel}>ASPECT RATIO</Text>
            <View style={styles.ratioRow}>
              {ratios.map((item) => (
                <Pressable
                  key={item.ratio}
                  onPress={() => setRatio(item.ratio)}
                  style={[
                    styles.ratioCard,
                    ratio === item.ratio && styles.selectedCard,
                  ]}
                >
                  <View style={styles.ratioGraphic}>
                    <View
                      style={[
                        styles.ratioShape,
                        {
                          width: item.width,
                          height: item.height,
                          borderColor:
                            ratio === item.ratio ? ACCENT : MUTED,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.optionTitle}>{item.ratio}</Text>
                  <Text style={styles.mutedSmall}>{item.label}</Text>
                  {ratio === item.ratio && (
                    <Check size={15} color={ACCENT} />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>FRAME RATE</Text>
            <View style={styles.choiceRow}>
              {[24, 30, 60, 120].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setFps(value)}
                  style={[
                    styles.choice,
                    fps === value && styles.selectedChoice,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      fps === value && styles.selectedText,
                    ]}
                  >
                    {value}
                  </Text>
                  <Text style={styles.mutedSmall}>fps</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>PROJECT QUALITY</Text>
            <View style={styles.choiceRow}>
              {[360, 480, 720, 1080].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setQuality(value)}
                  style={[
                    styles.choice,
                    quality === value && styles.selectedChoice,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      quality === value && styles.selectedText,
                    ]}
                  >
                    {value}p
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <SlidersHorizontal size={19} color={ACCENT} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>project settings</Text>
                <Text style={styles.muted}>
                  {ratio} · {fps} fps · {quality}p
                </Text>
              </View>
            </View>

            <Pressable style={styles.createButton} onPress={createProject}>
              <Text style={styles.createButtonText}>create project</Text>
              <Plus color="#0b0b10" size={20} strokeWidth={3} />
            </Pressable>
          </ScrollView>
        </View>
      )}

      {screen === "editor" && activeProject && (
        <View style={styles.page}>
          <View style={styles.editorTop}>
            <Pressable onPress={goHome} style={styles.backButton}>
              <ChevronLeft color="#fff" size={22} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.editorName}>
                {activeProject.name}
              </Text>
              <Text style={styles.mutedSmall}>
                {activeProject.ratio} · {activeProject.fps} fps ·{" "}
                {activeProject.quality}p
              </Text>
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => setPanel(panel === "settings" ? "none" : "settings")}
            >
              <Settings2 color="#fff" size={20} />
            </Pressable>
          </View>

          <View style={styles.previewArea}>
            <VideoPreview
              clip={currentClip || activeProject.clips[0]}
              ratio={activeProject.ratio}
            />
            <View style={styles.previewActions}>
              <Text style={styles.mutedSmall}>
                {currentClip ? currentClip.name : "composition preview"}
              </Text>
              <View style={styles.previewActionRow}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setPanel("settings")}
                >
                  <Crop color="#fff" size={18} />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setPanel("effects")}
                >
                  <Sparkles color="#fff" size={18} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.timelineHeader}>
            <View style={styles.timelineTime}>
              <Clock3 size={15} color={MUTED} />
              <Text style={styles.mutedSmall}>00:00</Text>
            </View>
            <View style={styles.timelineControls}>
              <Pressable
                style={styles.iconButton}
                onPress={() => setPanel("media")}
              >
                <Plus size={21} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => setPanel("audio")}
              >
                <Music2 size={18} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => setPanel("effects")}
              >
                <Sparkles size={18} color="#fff" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.timeline}
            contentContainerStyle={styles.timelineContent}
          >
            {activeProject.clips.length === 0 ? (
              <Pressable
                onPress={() => setPanel("media")}
                style={styles.emptyTimeline}
              >
                <Plus color={ACCENT} size={24} />
                <Text style={styles.optionTitle}>add your first clip</Text>
                <Text style={styles.mutedSmall}>
                  import photos or videos from your library
                </Text>
              </Pressable>
            ) : (
              activeProject.clips.map((clip, index) => (
                <Pressable
                  key={clip.id}
                  onPress={() => {
                    setSelectedClip(clip.id);
                    setMenuOpen(false);
                  }}
                  style={[
                    styles.clipRow,
                    selectedClip === clip.id && styles.selectedClipRow,
                  ]}
                >
                  <View style={styles.clipIcon}>
                    {clip.kind === "video" ? (
                      <Video size={17} color={ACCENT} />
                    ) : (
                      <ImagePlus size={17} color={ACCENT} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.clipName}>
                      {clip.name}
                    </Text>
                    <Text style={styles.mutedSmall}>
                      {clip.kind} · {clip.fit}
                    </Text>
                  </View>
                  <Text style={styles.mutedSmall}>
                    {Math.max(1, Math.round(clip.duration))}s
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSelectedClip(clip.id);
                      setMenuOpen(true);
                    }}
                    style={styles.smallIconButton}
                  >
                    <MoreHorizontal color="#fff" size={20} />
                  </Pressable>
                </Pressable>
              ))
            )}
          </ScrollView>

          <View style={styles.toolBar}>
            <Pressable style={styles.tool} onPress={() => setPanel("media")}>
              <Plus color={ACCENT} size={21} />
              <Text style={styles.toolText}>media</Text>
            </Pressable>
            <Pressable style={styles.tool} onPress={() => setPanel("effects")}>
              <WandSparkles color="#fff" size={21} />
              <Text style={styles.toolText}>effects</Text>
            </Pressable>
            <Pressable style={styles.tool} onPress={() => setPanel("audio")}>
              <AudioLines color="#fff" size={21} />
              <Text style={styles.toolText}>audio</Text>
            </Pressable>
            <Pressable
              style={styles.tool}
              onPress={() => setPanel("settings")}
            >
              <Layers color="#fff" size={21} />
              <Text style={styles.toolText}>project</Text>
            </Pressable>
          </View>

          {panel !== "none" && (
            <View style={styles.bottomPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>
                  {panel === "media"
                    ? "add media"
                    : panel === "effects"
                    ? "effects"
                    : panel === "audio"
                    ? "audio tools"
                    : "project settings"}
                </Text>
                <Pressable onPress={() => setPanel("none")}>
                  <X size={21} color="#fff" />
                </Pressable>
              </View>

              {panel === "media" && (
                <View style={styles.panelContent}>
                  <ActionButton
                    title="import photos and videos"
                    icon={<ImagePlus color="#fff" size={19} />}
                    onPress={addMedia}
                  />
                  <Text style={styles.mutedSmall}>
                    motionx will request photo library access when needed.
                  </Text>
                </View>
              )}

              {panel === "effects" && (
                <ScrollView horizontal contentContainerStyle={styles.effectList}>
                  {[
                    ["blur", "soften"],
                    ["glow", "light"],
                    ["color", "adjust"],
                    ["shadow", "depth"],
                    ["distortion", "warp"],
                    ["motion", "animate"],
                    ["keyframes", "timing"],
                  ].map(([name, category]) => (
                    <Pressable
                      key={name}
                      style={styles.effectCard}
                      onPress={() =>
                        Alert.alert(
                          name,
                          `the ${name} effect needs its processing implementation before it can change your footage.`
                        )
                      }
                    >
                      <Sparkles color={ACCENT} size={21} />
                      <Text style={styles.optionTitle}>{name}</Text>
                      <Text style={styles.mutedSmall}>{category}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {panel === "audio" && (
                <View style={styles.panelContent}>
                  <ActionButton
                    title="import audio or video"
                    icon={<Music2 color="#fff" size={19} />}
                    onPress={addMedia}
                  />
                  <ActionButton
                    title="extract audio from selected video"
                    icon={<AudioLines color="#fff" size={19} />}
                    secondary
                    onPress={extractAudio}
                  />
                </View>
              )}

              {panel === "settings" && (
                <View style={styles.panelContent}>
                  <Text style={styles.muted}>
                    {activeProject.ratio} · {activeProject.fps} fps ·{" "}
                    {activeProject.quality}p
                  </Text>
                  <ActionButton
                    title="back to projects"
                    icon={<FolderOpen color="#fff" size={19} />}
                    secondary
                    onPress={goHome}
                  />
                </View>
              )}
            </View>
          )}

          {menuOpen && currentClip && (
            <View style={styles.modalBackdrop}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setMenuOpen(false)}
              />
              <View style={styles.clipMenu}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>clip options</Text>
                  <Pressable onPress={() => setMenuOpen(false)}>
                    <X color="#fff" size={20} />
                  </Pressable>
                </View>
                <Text style={styles.mutedSmall}>composition sizing</Text>
                <View style={styles.choiceRow}>
                  {(["fit", "fill"] as const).map((mode) => (
                    <Pressable
                      key={mode}
                      onPress={() => updateClip(currentClip.id, { fit: mode })}
                      style={[
                        styles.choice,
                        currentClip.fit === mode && styles.selectedChoice,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          currentClip.fit === mode && styles.selectedText,
                        ]}
                      >
                        {mode}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <ActionButton
                  title="extract audio"
                  icon={<AudioLines color="#fff" size={18} />}
                  onPress={extractAudio}
                />
                <ActionButton
                  title="delete clip"
                  secondary
                  icon={<X color="#fff" size={18} />}
                  onPress={deleteClip}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  page: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#211b35",
  },
  brand: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -1 },
  muted: { color: MUTED, fontSize: 12, marginTop: 3 },
  mutedSmall: { color: MUTED, fontSize: 10, marginTop: 3 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PANEL2,
    alignItems: "center",
    justifyContent: "center",
  },
  homeContent: { padding: 20, paddingBottom: 30 },
  hero: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 25,
    padding: 23,
    marginBottom: 28,
    overflow: "hidden",
  },
  eyebrow: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 37,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -1.5,
    marginTop: 14,
  },
  createButton: {
    marginTop: 23,
    minHeight: 51,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  createButtonText: { color: "#0b0b10", fontSize: 14, fontWeight: "900" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  emptyProjects: {
    minHeight: 175,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BORDER,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 6,
  },
  emptyTitle: { color: "#fff", fontWeight: "800", marginTop: 6 },
  projectCard: {
    backgroundColor: PANEL,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 10,
  },
  projectThumbnail: {
    width: 63,
    height: 63,
    backgroundColor: "#211b35",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: { flex: 1 },
  projectName: { color: "#fff", fontSize: 14, fontWeight: "800" },
  footer: {
    color: "#55596b",
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 1.2,
    padding: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PANEL2,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  setupContent: { padding: 22, paddingBottom: 40 },
  fieldLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 27,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: PANEL,
    color: "#fff",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
  },
  ratioRow: { flexDirection: "row", gap: 10 },
  ratioCard: {
    flex: 1,
    minHeight: 126,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: PANEL,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 7,
  },
  selectedCard: { borderColor: ACCENT, backgroundColor: "#1d1930" },
  ratioGraphic: {
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  ratioShape: { borderWidth: 2, borderRadius: 4 },
  optionTitle: { color: "#fff", fontSize: 12, fontWeight: "800" },
  choiceRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  choice: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 7,
  },
  selectedChoice: { borderColor: ACCENT, backgroundColor: "#211b35" },
  choiceText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  selectedText: { color: ACCENT },
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 15,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    marginTop: 26,
  },
  editorTop: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  editorName: { color: "#fff", fontSize: 14, fontWeight: "800" },
  previewArea: {
    flex: 1,
    minHeight: 190,
    maxHeight: "47%",
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: "center",
    backgroundColor: "#07080c",
  },
  previewOuter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  preview: {
    backgroundColor: "#11131c",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#36394a",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPreview: { alignItems: "center", justifyContent: "center", padding: 15 },
  previewIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: "#211b35",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  previewTitle: { color: "#fff", fontSize: 14, fontWeight: "800" },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 5,
  },
  previewActionRow: { flexDirection: "row", gap: 7 },
  timelineHeader: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  timelineTime: { flexDirection: "row", gap: 7, alignItems: "center" },
  timelineControls: { flexDirection: "row", gap: 7 },
  timeline: { flex: 1, minHeight: 100, maxHeight: "34%" },
  timelineContent: { padding: 12, gap: 7 },
  emptyTimeline: {
    minHeight: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BORDER,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  clipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: PANEL,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 9,
  },
  selectedClipRow: { borderColor: ACCENT },
  clipIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#211b35",
    alignItems: "center",
    justifyContent: "center",
  },
  clipName: { color: "#fff", fontSize: 12, fontWeight: "700" },
  smallIconButton: {
    width: 29,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  toolBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#0d0e15",
  },
  tool: { alignItems: "center", gap: 4, minWidth: 58 },
  toolText: { color: "#d6d7e2", fontSize: 10, fontWeight: "700" },
  bottomPanel: {
    borderTopWidth: 1,
    borderColor: BORDER,
    backgroundColor: PANEL,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 18,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  panelTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  panelContent: { gap: 10 },
  actionButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    backgroundColor: ACCENT,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: PANEL2,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  effectList: { gap: 9, paddingBottom: 4 },
  effectCard: {
    minWidth: 93,
    padding: 13,
    borderRadius: 14,
    backgroundColor: PANEL2,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 6,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0009",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  clipMenu: {
    backgroundColor: PANEL,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    paddingBottom: 30,
    gap: 10,
  },
});
