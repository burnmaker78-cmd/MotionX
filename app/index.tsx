
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AudioLines,
  Clapperboard,
  Diamond,
  Film,
  Gauge,
  Layers,
  Music,
  Plus,
  Settings2,
  Sparkles,
  Type,
  Undo2,
  Redo2,
  Play,
  ChevronLeft,
} from "lucide-react-native";

const purple = "#a78bfa";
const panel = "#17171f";
const muted = "#858595";

export default function App() {
  const [fps, setFps] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState("video");
  const [clips, setClips] = useState([
    { id: 1, name: "video 1", color: "#6552b9" },
    { id: 2, name: "video 2", color: "#3c789a" },
  ]);

  function addClip() {
    setClips((old) => [
      ...old,
      {
        id: Date.now(),
        name: `video ${old.length + 1}`,
        color: old.length % 2 ? "#6552b9" : "#3c789a",
      },
    ]);
  }

  function tool(name: string, icon: React.ReactNode) {
    return (
      <Pressable
        onPress={() => setSelected(name)}
        style={[styles.tool, selected === name && styles.activeTool]}
      >
        {icon}
        <Text style={styles.toolText}>{name}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b10" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable style={styles.back}>
            <ChevronLeft color="white" size={23} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>MotionX</Text>
            <Text style={styles.subtitle}>motion studio</Text>
          </View>
          <Pressable style={styles.headerButton}>
            <Undo2 color="white" size={19} />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Redo2 color={muted} size={19} />
          </Pressable>
          <Pressable style={styles.export}>
            <Text style={styles.exportText}>export</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#211d36", "#111119", "#0d0d13"]}
            style={styles.preview}
          >
            <View style={styles.previewTop}>
              <View style={styles.liveTag}>
                <View style={styles.dot} />
                <Text style={styles.smallWhite}>preview</Text>
              </View>
              <Text style={styles.fpsLabel}>{fps} fps</Text>
            </View>

            <View style={styles.previewCenter}>
              <View style={styles.previewIcon}>
                <Film color={purple} size={35} />
              </View>
              <Text style={styles.emptyTitle}>your next edit</Text>
              <Text style={styles.emptySubtitle}>
                import footage to get started
              </Text>
            </View>

            <View style={styles.previewBottom}>
              <Text style={styles.time}>00:00:00</Text>
              <Pressable
                onPress={() => setPlaying(!playing)}
                style={styles.playButton}
              >
                {playing ? (
                  <View style={styles.pauseIcon}>
                    <View style={styles.pauseBar} />
                    <View style={styles.pauseBar} />
                  </View>
                ) : (
                  <Play color="#100c19" size={20} fill="#100c19" />
                )}
              </Pressable>
              <Text style={styles.time}>00:00:10</Text>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>project settings</Text>
            <Settings2 color={muted} size={18} />
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>frame rate</Text>
                <Text style={styles.settingDescription}>
                  project playback target
                </Text>
              </View>
              <View style={styles.fpsOptions}>
                {[30, 60, 120].map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setFps(value)}
                    style={[
                      styles.fpsButton,
                      fps === value && styles.fpsSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.fpsText,
                        fps === value && styles.fpsTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>editing tools</Text>
            <Text style={styles.sectionHint}>tap to select</Text>
          </View>

          <View style={styles.toolsGrid}>
            {tool("video", <Clapperboard color={purple} size={22} />)}
            {tool("effects", <Sparkles color={purple} size={22} />)}
            {tool("keyframes", <Diamond color={purple} size={22} />)}
            {tool("velocity", <Gauge color={purple} size={22} />)}
            {tool("audio", <Music color={purple} size={22} />)}
            {tool("text", <Type color={purple} size={22} />)}
            {tool("layers", <Layers color={purple} size={22} />)}
            {tool("sound", <AudioLines color={purple} size={22} />)}
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>timeline</Text>
            <Pressable onPress={addClip} style={styles.addButton}>
              <Plus color={purple} size={17} />
              <Text style={styles.addText}>add track</Text>
            </Pressable>
          </View>

          <View style={styles.timeline}>
            <View style={styles.ruler}>
              {["00:00", "00:02", "00:04", "00:06", "00:08"].map(
                (time) => (
                  <Text key={time} style={styles.rulerText}>
                    {time}
                  </Text>
                )
              )}
            </View>

            {clips.map((clip) => (
              <View style={styles.trackRow} key={clip.id}>
                <View style={styles.trackLabel}>
                  <Film color={muted} size={15} />
                  <Text numberOfLines={1} style={styles.trackName}>
                    {clip.name}
                  </Text>
                </View>
                <View style={styles.trackContent}>
                  <View
                    style={[
                      styles.clip,
                      { backgroundColor: clip.color },
                    ]}
                  >
                    <Text style={styles.clipText}>{clip.name}</Text>
                    <View style={styles.clipLine} />
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.playhead} />
            <Text style={styles.timelineNote}>
              timeline preview · editing tools coming next
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>MotionX</Text>
            <Text style={styles.footerText}>
              made for creators. built for motion.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b10" },
  root: { flex: 1, backgroundColor: "#0b0b10" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#24242d",
  },
  back: {
    width: 34,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { color: "white", fontSize: 21, fontWeight: "800" },
  subtitle: { color: muted, fontSize: 10, marginTop: 2 },
  headerButton: {
    width: 34,
    height: 36,
    borderRadius: 10,
    backgroundColor: panel,
    alignItems: "center",
    justifyContent: "center",
  },
  export: {
    backgroundColor: purple,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  exportText: { color: "#100c19", fontSize: 12, fontWeight: "800" },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 36, gap: 16 },
  preview: {
    height: 300,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#302747",
    padding: 13,
    justifyContent: "space-between",
  },
  previewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#29233b",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#a78bfa" },
  smallWhite: { color: "#e4dafa", fontSize: 11 },
  fpsLabel: { color: purple, fontSize: 12, fontWeight: "700" },
  previewCenter: { alignItems: "center", gap: 7 },
  previewIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: "#29213c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { color: "white", fontSize: 17, fontWeight: "700" },
  emptySubtitle: { color: muted, fontSize: 12 },
  previewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: { color: "#c2c0d0", fontSize: 11, fontVariant: ["tabular-nums"] },
  playButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: purple,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIcon: { flexDirection: "row", gap: 4 },
  pauseBar: { height: 15, width: 4, borderRadius: 2, backgroundColor: "#100c19" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  sectionTitle: { color: "white", fontSize: 15, fontWeight: "700" },
  sectionHint: { color: muted, fontSize: 11 },
  settingsCard: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: "#292933",
    borderRadius: 14,
    padding: 14,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  settingTitle: { color: "white", fontSize: 13, fontWeight: "600" },
  settingDescription: { color: muted, fontSize: 10, marginTop: 4 },
  fpsOptions: { flexDirection: "row", gap: 5 },
  fpsButton: {
    backgroundColor: "#262630",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 8,
  },
  fpsSelected: { backgroundColor: purple },
  fpsText: { color: "#d0cdda", fontSize: 12, fontWeight: "600" },
  fpsTextSelected: { color: "#100c19" },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  tool: {
    width: "23%",
    minHeight: 82,
    flexGrow: 1,
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: "#292933",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  activeTool: { borderColor: purple, backgroundColor: "#211a32" },
  toolText: { color: "#dedbe8", fontSize: 11, fontWeight: "600" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 7,
  },
  addText: { color: purple, fontSize: 11, fontWeight: "600" },
  timeline: {
    backgroundColor: "#121219",
    borderWidth: 1,
    borderColor: "#292933",
    borderRadius: 14,
    padding: 10,
    gap: 10,
    position: "relative",
    overflow: "hidden",
  },
  ruler: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#30303a",
  },
  rulerText: { color: muted, fontSize: 9 },
  trackRow: { flexDirection: "row", gap: 8, minHeight: 48 },
  trackLabel: {
    width: 75,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackName: { color: "#c9c6d4", fontSize: 10, flex: 1 },
  trackContent: { flex: 1, justifyContent: "center" },
  clip: {
    height: 35,
    borderRadius: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    overflow: "hidden",
  },
  clipText: { color: "white", fontSize: 10, fontWeight: "700" },
  clipLine: {
    height: 2,
    backgroundColor: "#ffffff55",
    marginTop: 5,
    width: "70%",
  },
  playhead: {
    position: "absolute",
    left: "42%",
    top: 29,
    bottom: 25,
    width: 2,
    backgroundColor: "#e5dcff",
  },
  timelineNote: { color: muted, fontSize: 9, textAlign: "center", marginTop: 3 },
  footer: { alignItems: "center", paddingVertical: 12, gap: 5 },
  footerBrand: { color: purple, fontSize: 14, fontWeight: "800" },
  footerText: { color: muted, fontSize: 10 },
});
