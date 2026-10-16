import SwiftUI
import PhotosUI

enum CanvasRatio: String, CaseIterable, Identifiable {
    case portrait = "9:16", square = "1:1", landscape = "16:9"
    var id: String { rawValue }
    var size: CGSize {
        switch self {
        case .portrait: return CGSize(width: 240, height: 426)
        case .square: return CGSize(width: 300, height: 300)
        case .landscape: return CGSize(width: 426, height: 240)
        }
    }
}

enum LayerKind: String, CaseIterable, Identifiable {
    case text = "Text", circle = "Circle", square = "Square", photo = "Photo", vector = "Vector"
    var id: String { rawValue }
}

struct MotionLayer: Identifiable {
    let id = UUID()
    var name: String
    var kind: LayerKind
    var text: String = "MotionX"
    var color: Color = .purple
    var x: CGFloat = 0
    var y: CGFloat = 0
    var scale: CGFloat = 1
    var rotation: Double = 0
    var opacity: Double = 1
    var effect: String = "None"
    var effectAmount: Double = 0.5
    var image: UIImage? = nil
}

struct ContentView: View {
    @State private var projectName = "My MotionX Edit"
    @State private var ratio: CanvasRatio = .portrait
    @State private var fps = 30
    @State private var duration: Double = 10
    @State private var playhead: Double = 0
    @State private var playing = false
    @State private var layers: [MotionLayer] = []
    @State private var selectedID: UUID?
    @State private var showSetup = true
    @State private var showVector = false
    @State private var vectorPoints: [CGPoint] = []
    @State private var pickerItem: PhotosPickerItem?
    @State private var appearance = "Dark"
    @State private var showSettings = false
    @State private var showTextPrompt = false
    @State private var newText = "MotionX"
    @State private var effectName = "None"
    @State private var exportMessage = ""
    @State private var timer: Timer?
    private let effects = ["None", "Oscillate", "Motion Blur", "Motion Tile", "Bend", "Scale Assist", "Stretch Axis", "Glow", "Shadow", "Gaussian Blur", "Shake", "Wave Warp", "Hue Shift"]

    var selectedIndex: Int? { layers.firstIndex { $0.id == selectedID } }
    var selectedLayer: MotionLayer? { selectedIndex.map { layers[$0] } }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                header
                if showSetup {
                    setupView
                } else {
                    editorView
                }
            }
            .background(Color(uiColor: .systemBackground))
            .navigationBarHidden(true)
            .sheet(isPresented: $showSettings) { settingsSheet }
            .alert("Add text layer", isPresented: $showTextPrompt) {
                TextField("Text", text: $newText)
                Button("Cancel", role: .cancel) {}
                Button("Add") {
                    var layer = MotionLayer(name: String(newText.prefix(20)), kind: .text, text: newText)
                    layer.x = 0; layer.y = 0
                    layers.append(layer); selectedID = layer.id
                }
            }
            .onChange(of: pickerItem) { _, item in
                Task {
                    guard let data = try? await item?.loadTransferable(type: Data.self),
                          let image = UIImage(data: data) else { return }
                    var layer = MotionLayer(name: "Photo", kind: .photo, color: .white, image: image)
                    layer.x = 0; layer.y = 0
                    layers.append(layer); selectedID = layer.id
                }
            }
            .onDisappear { stopPlayback() }
        }
        .preferredColorScheme(appearance == "Dark" ? .dark : .light)
    }

    private var header: some View {
        HStack(spacing: 10) {
            Text("Motion").font(.system(size: 24, weight: .black, design: .rounded))
            Text("X").font(.system(size: 24, weight: .black, design: .rounded)).foregroundStyle(.purple)
            Spacer()
            if !showSetup {
                Button { showSetup = true; stopPlayback() } label: { Image(systemName: "house") }
                Button { showSettings = true } label: { Image(systemName: "gearshape") }
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .background(.ultraThinMaterial)
    }

    private var setupView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Your creative space").font(.caption.bold()).foregroundStyle(.purple)
                Text("Make something move.").font(.largeTitle.bold())
                Text("Your edits. Your style. Your timeline.").foregroundStyle(.secondary)
                GroupBox("Project name") { TextField("Project name", text: $projectName) }
                GroupBox("Canvas ratio") {
                    Picker("Canvas ratio", selection: $ratio) {
                        ForEach(CanvasRatio.allCases) { Text($0.rawValue).tag($0) }
                    }.pickerStyle(.segmented)
                }
                GroupBox("Frame rate") {
                    Picker("FPS", selection: $fps) {
                        ForEach([15, 24, 25, 30, 48, 50, 60, 90, 120], id: \.self) { Text("\($0) FPS").tag($0) }
                    }.pickerStyle(.menu)
                }
                Button {
                    showSetup = false
                } label: {
                    Label("Create project", systemImage: "plus.circle.fill")
                        .font(.headline).frame(maxWidth: .infinity).padding()
                }.buttonStyle(.borderedProminent).tint(.purple)
                Text("Free creative tools · No Pro tier").font(.footnote).foregroundStyle(.secondary)
            }.padding()
        }
    }

    private var editorView: some View {
        VStack(spacing: 10) {
            HStack {
                TextField("Project name", text: $projectName).font(.headline)
                Text("\(ratio.rawValue) · \(fps) FPS").font(.caption).foregroundStyle(.secondary)
            }.padding(.horizontal)
            GeometryReader { geo in
                let target = ratio.size
                let factor = min(geo.size.width / target.width, geo.size.height / target.height)
                ZStack {
                    Color.black.opacity(0.75)
                    ZStack {
                        Color(red: 0.075, green: 0.08, blue: 0.13)
                        ForEach(layers) { layer in
                            layerView(layer)
                        }
                        if layers.isEmpty {
                            Text("Add media or a layer").foregroundStyle(.white.opacity(0.65))
                        }
                    }
                    .frame(width: target.width * factor, height: target.height * factor)
                    .clipped()
                }
            }
            .frame(height: 290)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .padding(.horizontal, 10)

            HStack(spacing: 12) {
                PhotosPicker(selection: $pickerItem, matching: .images) {
                    Label("Media", systemImage: "photo").font(.caption.bold())
                }
                Button { showTextPrompt = true } label: { Label("Text", systemImage: "textformat").font(.caption.bold()) }
                Button { addShape(.circle) } label: { Label("Circle", systemImage: "circle").font(.caption.bold()) }
                Button { addShape(.square) } label: { Label("Square", systemImage: "square").font(.caption.bold()) }
                Button { showVector = true } label: { Label("Vector", systemImage: "scribble.variable").font(.caption.bold()) }
            }.buttonStyle(.bordered).tint(.purple).padding(.horizontal, 4)

            HStack {
                Button { playhead = 0; stopPlayback() } label: { Image(systemName: "backward.end.fill") }
                Button { playing ? stopPlayback() : startPlayback() } label: {
                    Image(systemName: playing ? "pause.fill" : "play.fill")
                        .font(.title3).frame(width: 42, height: 34)
                }.buttonStyle(.borderedProminent).tint(.purple)
                Button { playhead = min(duration, playhead + 1 / Double(fps)) } label: { Image(systemName: "forward.frame.fill") }
                Spacer()
                Text(timeString(playhead)).monospacedDigit().font(.caption.bold())
            }.padding(.horizontal)

            VStack(alignment: .leading, spacing: 7) {
                HStack {
                    Text("TIMELINE").font(.caption.bold())
                    Spacer()
                    Button("＋ Keyframe") { addKeyframeMarker() }.font(.caption.bold())
                }
                Slider(value: $playhead, in: 0...duration)
                ScrollView(.horizontal) {
                    VStack(alignment: .leading, spacing: 5) {
                        ForEach(layers) { layer in
                            Button {
                                selectedID = layer.id
                            } label: {
                                HStack {
                                    Text(layer.name).lineLimit(1).frame(width: 88, alignment: .leading)
                                    RoundedRectangle(cornerRadius: 5)
                                        .fill(selectedID == layer.id ? Color.cyan.opacity(0.8) : Color.purple.opacity(0.75))
                                        .frame(width: 170, height: 27)
                                        .overlay(alignment: .leading) {
                                            if selectedID == layer.id { Text("◆").foregroundStyle(.white).padding(.leading, 6) }
                                        }
                                }.font(.caption)
                            }.buttonStyle(.plain)
                        }
                    }
                }.frame(maxHeight: 125)
            }.padding(10).background(.ultraThinMaterial).clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 10)

            if let idx = selectedIndex {
                inspector(index: idx)
            } else {
                Text("Select a layer in the timeline to edit it.").font(.caption).foregroundStyle(.secondary).padding(.bottom, 8)
            }
            Spacer(minLength: 0)
        }
        .sheet(isPresented: $showVector) { vectorSheet }
    }

    @ViewBuilder private func layerView(_ layer: MotionLayer) -> some View {
        let isSelected = layer.id == selectedID
        Group {
            if let image = layer.image {
                Image(uiImage: image).resizable().scaledToFit()
                    .frame(width: 150 * layer.scale, height: 150 * layer.scale)
            } else if layer.kind == .text {
                Text(layer.text).font(.system(size: 30 * layer.scale, weight: .bold))
                    .foregroundStyle(layer.color).multilineTextAlignment(.center)
            } else if layer.kind == .circle {
                Circle().fill(layer.color).frame(width: 100 * layer.scale, height: 100 * layer.scale)
            } else {
                Rectangle().fill(layer.color).frame(width: 110 * layer.scale, height: 90 * layer.scale)
            }
        }
        .opacity(layer.opacity)
        .rotationEffect(.degrees(layer.rotation))
        .overlay {
            if isSelected {
                RoundedRectangle(cornerRadius: 4).stroke(.cyan, style: StrokeStyle(lineWidth: 1, dash: [5]))
                    .frame(width: 165 * layer.scale, height: 150 * layer.scale)
            }
        }
        .offset(x: layer.x, y: layer.y)
        .onTapGesture { selectedID = layer.id }
    }

    private func inspector(index: Int) -> some View {
        let binding = $layers[index]
        return ScrollView(.horizontal) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(binding.wrappedValue.name).font(.caption.bold())
                    Spacer()
                    Button(role: .destructive) {
                        let id = binding.wrappedValue.id
                        layers.removeAll { $0.id == id }; selectedID = nil
                    } label: { Image(systemName: "trash") }
                }
                HStack {
                    Text("Scale").frame(width: 48, alignment: .leading)
                    Slider(value: binding.scale, in: 0.2...3)
                    Text(binding.scale.wrappedValue, format: .number.precision(.fractionLength(1))).frame(width: 30)
                }
                HStack {
                    Text("Rotate").frame(width: 48, alignment: .leading)
                    Slider(value: binding.rotation, in: -180...180)
                    Text("\(Int(binding.rotation.wrappedValue))°").frame(width: 36)
                }
                HStack {
                    Text("Opacity").frame(width: 48, alignment: .leading)
                    Slider(value: binding.opacity, in: 0...1)
                }
                HStack {
                    Text("Effect").frame(width: 48, alignment: .leading)
                    Picker("Effect", selection: binding.effect) {
                        ForEach(effects, id: \.self) { Text($0).tag($0) }
                    }.labelsHidden()
                    Slider(value: binding.effectAmount, in: 0...1)
                }
            }.font(.caption).padding(10).frame(minWidth: 330)
        }.frame(height: 145).background(.ultraThinMaterial).clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 10)
    }

    private var vectorSheet: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Text("Tap the drawing area to add points. Undo a point or finish to add the path as a layer.")
                    .font(.caption).foregroundStyle(.secondary).padding(.horizontal)
                GeometryReader { geo in
                    ZStack {
                        Color.black.opacity(0.9)
                        Path { path in
                            for (i, point) in vectorPoints.enumerated() {
                                if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
                            }
                            if vectorPoints.count > 2 { path.closeSubpath() }
                        }.stroke(.purple, style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                        ForEach(Array(vectorPoints.enumerated()), id: \.offset) { _, point in
                            Circle().fill(.cyan).frame(width: 9, height: 9).position(point)
                        }
                        Text("Tap to add points").foregroundStyle(.white.opacity(0.25)).allowsHitTesting(false)
                    }
                    .contentShape(Rectangle())
                    .onTapGesture { point in vectorPoints.append(point) }
                }
                HStack {
                    Button("Undo point") { if !vectorPoints.isEmpty { vectorPoints.removeLast() } }
                    Button("Clear") { vectorPoints = [] }
                    Button("Finish") {
                        guard vectorPoints.count >= 2 else { return }
                        var layer = MotionLayer(name: "Vector path", kind: .vector, color: .purple)
                        layer.text = "Vector path · \(vectorPoints.count) points"
                        layers.append(layer); selectedID = layer.id
                        vectorPoints = []; showVector = false
                    }.buttonStyle(.borderedProminent).tint(.purple)
                }
                Spacer()
            }.padding()
            .navigationTitle("Vector drawing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { showVector = false } } }
        }
        .presentationDetents([.medium, .large])
    }

    private var settingsSheet: some View {
        NavigationStack {
            Form {
                Picker("Appearance", selection: $appearance) {
                    Text("Dark").tag("Dark"); Text("Light").tag("Light")
                }
                Section("MotionX") {
                    Label("No Pro subscription", systemImage: "checkmark.seal")
                    Label("Creative tools for everyone", systemImage: "sparkles")
                }
            }.navigationTitle("Settings").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Done") { showSettings = false } } }
        }.presentationDetents([.medium])
    }

    private func addShape(_ kind: LayerKind) {
        var layer = MotionLayer(name: kind.rawValue, kind: kind, color: .purple)
        layer.x = 0; layer.y = 0
        layers.append(layer); selectedID = layer.id
    }

    private func startPlayback() {
        guard !playing else { return }
        playing = true
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1 / Double(fps), repeats: true) { _ in
            DispatchQueue.main.async {
                playhead += 1 / Double(fps)
                if playhead >= duration { playhead = 0 }
            }
        }
    }

    private func stopPlayback() {
        playing = false
        timer?.invalidate()
        timer = nil
    }

    private func addKeyframeMarker() {
        guard let idx = selectedIndex else { exportMessage = "Select a layer first"; return }
        // Starter marker: full per-property interpolation is a later rendering milestone.
        layers[idx].name = layers[idx].name.replacingOccurrences(of: " ◆", with: "") + " ◆"
    }

    private func timeString(_ value: Double) -> String {
        String(format: "%02d:%05.2f", Int(value) / 60, value.truncatingRemainder(dividingBy: 60))
    }
}
