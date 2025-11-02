               }
                        timestamp = frame_count / fps
                        event_data = {
                            'Frame': frame_count,
                            'Timestamp (s)': f"{timestamp:.2f}",
                            'Event': 'Pass',
                            'From Player ID': last_puck_possessor_id,
                            'From JN': from_jn,
                            'To Player ID': current_puck_possessor_id,
                            'To JN': to_jn,
                            'Details': f"Pass from Player #{last_puck_possessor_id} (JN: {from_jn}) to Player #{current_puck_possessor_id} (JN: {to_jn})"
                        }
                        event_log.append(event_data)
                        save_event_info = None

                puck_in_goal = False
                if puck_bbox is not None and current_goal_boxes:
                    for goal_box in current_goal_boxes:
                        if iou(puck_bbox, goal_box) > 0:
                            puck_in_goal = True
                            break

                possessor_cls = current_player_classes.get(current_puck_possessor_id, None)
                shooter_id = last_player_possessor_id

                if (puck_in_goal and not goal_sequence_active and goal_event_info is None and possessor_cls != goaltender_cls_id and shooter_id is not None):
                    shooter_jn = track_jn_memory.get(shooter_id, "N/A")

                    goal_event_info = {
                        'shooter_id': shooter_id,
                        'shooter_jn': shooter_jn,
                        'display_frames': GOAL_EVENT_DISPLAY_DURATION
                    }

                    timestamp = frame_count / fps
                    event_data = {
                        'Frame': frame_count,
                        'Timestamp (s)': f"{timestamp:.2f}",
                        'Event': 'Goal',
                        'From Player ID': shooter_id,
                        'From JN': shooter_jn,
                        'To Player ID': 'N/A',
                        'To JN': 'N/A',
                        'Details': f"Goal scored by Player #{shooter_id} (JN: {shooter_jn})"
                    }
                    event_log.append(event_data)

                    goal_frame = frame_count
                    goal_shooter_id = event_data['From Player ID']
                    override_window_frames = fps * 2

                    indices_to_remove = []
                    for i in range(len(event_log) - 2, -1, -1):
                        event = event_log[i]
                        if (goal_frame - event['Frame']) >= override_window_frames:
                            break
                        if event['Event'] == 'Save':
                            save_shooter_id = event['From Player ID']
                            if save_shooter_id == goal_shooter_id:
                                indices_to_remove.append(i)

                    for i in sorted(indices_to_remove, reverse=True):
                        event_log.pop(i)

                    save_event_info = None
                    pass_event_info = None
                    goal_sequence_active = True

                if not puck_in_goal:
                    goal_sequence_active = False

                puck_possessor_id = current_puck_possessor_id
                if puck_possessor_id is not None:
                    last_puck_possessor_id = puck_possessor_id

            for i, box in enumerate(filtered_boxes):
                track_id = int(filtered_track_ids[i])
                x1, y1, x2, y2 = [int(c) for c in box]
                cls_id = int(filtered_classes[i])
                original_label_name = names_model1[cls_id]

                color = color_map.get(original_label_name.lower(), (255, 255, 255))

                if cls_id in target_classes_for_team:
                    jersey_number_str = track_jn_memory.get(track_id, "")
                    team_label = track_team_memory.get(track_id, "Undetermined")

                    if (is_second_pass and team_label == "Undetermined" and not jersey_number_str and jersey_model is not None and jersey_model_names is not None):
                        try:
                            player_crop = frame[y1:y2, x1:x2]
                            predicted_jn = run_jersey_model_on_crop(jersey_model, jersey_model_names, player_crop)

                            if predicted_jn:
                                existing_jns = set(track_jn_memory.values())

                                if predicted_jn in existing_jns:
                                    new_jn = f"{predicted_jn}A"
                                    if new_jn in all_rosters_set and new_jn not in existing_jns:
                                        predicted_jn = new_jn
                                    else:
                                        predicted_jn = None
                                elif predicted_jn not in all_rosters_set:
                                    predicted_jn = None

                                if predicted_jn:
                                    track_jn_memory[track_id] = predicted_jn
                                    jersey_number_str = predicted_jn
                        except Exception as e:
                            pass

                    if team_label == "Undetermined" and jersey_number_str:
                        if jersey_number_str in home_roster_set:
                            team_label = "Home"
                        elif jersey_number_str in away_roster_set:
                            team_label = "Away"

                        if team_label != "Undetermined":
                            track_team_memory[track_id] = team_label

                    if team_label == "Home":
                        color = HOME_TEAM_BBOX_COLOR
                    elif team_label == "Away":
                        color = AWAY_TEAM_BBOX_COLOR

                    if team_label == "Home":
                        team_prefix = "P:H"
                    elif team_label == "Away":
                        team_prefix = "P:A"
                    else:
                        team_prefix = "P"

                    final_label = f"{team_prefix} #{track_id}"
                    if jersey_number_str:
                        final_label += f" (JN: {jersey_number_str})"

                    if track_id == current_puck_possessor_id:
                        final_label += " (w/ Puck)"
                else:
                    final_label = original_label_name.capitalize()

                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(annotated_frame, final_label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        if pass_event_info and pass_event_info['display_frames'] > 0:
            pass_text = f"PASS: From JN:{pass_event_info['from_jn']} (#{pass_event_info['from']}) to JN:{pass_event_info['to_jn']} (#{pass_event_info['to']})"
            text_size = cv2.getTextSize(pass_text, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
            text_x = (frame_width - text_size[0]) // 2
            cv2.putText(annotated_frame, pass_text, (text_x, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, PASS_EVENT_COLOR, 2, cv2.LINE_AA)
            pass_event_info['display_frames'] -= 1
            if pass_event_info['display_frames'] == 0:
                pass_event_info = None

        if save_event_info and save_event_info['display_frames'] > 0:
            save_text = f"SAVE! Shooter JN:{save_event_info['shooter_jn']} | Goaltender JN:{save_event_info['goaltender_jn']}"
            text_size = cv2.getTextSize(save_text, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
            text_x = (frame_width - text_size[0]) // 2
            cv2.putText(annotated_frame, save_text, (text_x, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, SAVE_EVENT_COLOR, 2, cv2.LINE_AA)
            save_event_info['display_frames'] -= 1
            if save_event_info['display_frames'] == 0:
                save_event_info = None

        if goal_event_info and goal_event_info['display_frames'] > 0:
            goal_text = f"GOAL! Shooter JN:{goal_event_info['shooter_jn']} (#{goal_event_info['shooter_id']})"
            text_size = cv2.getTextSize(goal_text, cv2.FONT_HERSHEY_SIMPLEX, 1.5, 3)[0]
            text_x = (frame_width - text_size[0]) // 2
            cv2.rectangle(annotated_frame, (text_x - 10, 80 - text_size[1] - 10), (text_x + text_size[0] + 10, 80 + 10), (0, 0, 0), -1)
            cv2.putText(annotated_frame, goal_text, (text_x, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.5, GOAL_EVENT_COLOR, 3, cv2.LINE_AA)
            goal_event_info['display_frames'] -= 1
            if goal_event_info['display_frames'] == 0:
                goal_event_info = None

        out.write(annotated_frame)

    cap.release()
    out.release()

    if event_log:
        df = pd.DataFrame(event_log)
        cols = ['Frame', 'Timestamp (s)', 'Event', 'From Player ID', 'From JN', 'To Player ID', 'To JN', 'Details']
        for col in cols:
            if col not in df.columns:
                df[col] = pd.NA
        df = df[cols]
        df.to_excel(output_excel_path, index=False)

    manual_map_template = {}
    if all_player_goaltender_ids_seen:
        for track_id in sorted(list(all_player_goaltender_ids_seen)):
            if track_id not in track_jn_memory:
                manual_map_template[track_id] = ""

    with open(output_video_path, 'rb') as f:
        video_data = f.read()

    excel_data = None
    if event_log:
        with open(output_excel_path, 'rb') as f:
            excel_data = f.read()

    return {
        "video_base64": video_data.hex(),
        "excel_base64": excel_data.hex() if excel_data else None,
        "manual_map_template": manual_map_template,
        "event_count": len(event_log),
        "frames_processed": frame_count
    }

@app.local_entrypoint()
def main():
    print("Modal app configured. Deploy with: modal deploy modal_app.py")
