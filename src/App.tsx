import React from "react";
import {
    InputNumber,
    Radio,
    Divider,
    Checkbox,
    Select,
    Space,
    Input,
    ConfigProvider,
    Progress,
    Button,
    Splitter,
    Image,
    Layout,
    theme,
    Segmented,
} from "antd";
import appIcon from "./appIcon.png";
import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { streamVideo, confirmStreamVideo, createDownloadPdfFile } from "./main";
import "./index.css";
const { Header, Content } = Layout;

const font = "IBM Plex Sans JP";

const App: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ height: "100vh" }}>
            <Header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    backgroundColor: "#999999",
                }}
            >
                <Image preview={false} height={30} src={appIcon} />
                <a
                    href="https://github.com/ozawk/scanner"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <GithubOutlined
                        style={{
                            fontSize: 30,
                            color: "#111111",
                        }}
                    />
                </a>
            </Header>

            <Content
                style={{
                    height: "100vh",
                    backgroundColor: "#bbbbbb",
                }}
            >
                <Splitter>
                    <Splitter.Panel size={"70%"} resizable={false}>
                        <Splitter layout="vertical">
                            <Splitter.Panel
                                size={"64%"}
                                resizable={false}
                                style={{ padding: "2%" }}
                            >
                                <div
                                    style={{
                                        background: colorBgContainer,
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "1em",
                                    }}
                                >
                                    <video id="imgPrevVideo">
                                        ビデオストリームが利用できません.
                                    </video>
                                    <img id="imgConfirmed"></img>
                                </div>
                            </Splitter.Panel>
                            <Splitter.Panel style={{ padding: "2%" }}>
                                <div
                                    style={{
                                        background: colorBgContainer,
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "1em",
                                        padding: "2%",
                                    }}
                                >
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        defaultValue={3}
                                        addonAfter="秒ごとに撮影"
                                        size="large"
                                        style={{ width: 391 }}
                                    />
                                    &emsp;&emsp;
                                    <Button
                                        color="danger"
                                        variant="filled"
                                        size="large"
                                        style={{ width: 391 }}
                                    >
                                        一時停止 [X]
                                    </Button>
                                    &emsp;&emsp;
                                    <Button
                                        color="danger"
                                        variant="filled"
                                        size="large"
                                        style={{ width: 391 }}
                                    >
                                        前回のフレームを削除 [C]
                                    </Button>
                                    <br />
                                    <br />
                                    <Progress
                                        percent={70}
                                        percentPosition={{
                                            align: "center",
                                            type: "inner",
                                        }}
                                        size={[1232, 20]}
                                        format={() => "1.23 秒"}
                                    />
                                    <br />
                                    <br />
                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        size="large"
                                        block
                                    >
                                        撮影モード変更 (現在:自動 変更後:手動)
                                        [Ctrl]
                                    </Button>
                                    <br />
                                    <br />
                                    <Button
                                        size="large"
                                        type="primary"
                                        block
                                        onClick={createDownloadPdfFile}
                                    >
                                        確定して終了 [Ctrl + Enter]
                                    </Button>
                                </div>
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel style={{ padding: "1.2%" }}>
                        <div
                            style={{
                                background: colorBgContainer,
                                height: "100%",
                                width: "100%",
                                borderRadius: "13px",
                                padding: "4%",
                                fontSize: "1em",
                            }}
                        >
                            <ConfigProvider
                                componentSize="large"
                                theme={{
                                    token: {
                                        fontFamily: font,
                                    },
                                }}
                            >
                                <Divider orientation="left">
                                    ページ番号と順番
                                </Divider>
                                <Radio value={1}>
                                    ページ順そのままに撮影する
                                </Radio>
                                <div style={{ fontFamily: font }}>
                                    最初のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    増分するページ:&emsp;
                                    <InputNumber
                                        addonBefore={
                                            <Select defaultValue="a">
                                                <Select value="a">+</Select>
                                                <Select value="b">-</Select>
                                            </Select>
                                        }
                                        defaultValue={1}
                                        style={{
                                            width: 130,
                                        }}
                                    />
                                </div>
                                <Radio value={2}>
                                    奇数ページ撮影後偶数ページを撮影する
                                </Radio>
                                <div style={{ fontFamily: font }}>
                                    奇数最初のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    奇数最後のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                    />
                                </div>
                                <Radio value={3}>ページを設定しない</Radio>
                                <Divider orientation="left">画像の処理</Divider>
                                <div style={{ fontFamily: font }}>
                                    画素の処理:&emsp;
                                    <Select
                                        defaultValue="a"
                                        size="small"
                                        style={{ width: 200 }}
                                        options={[
                                            {
                                                value: "a",
                                                label: "グレースケール",
                                            },
                                            {
                                                value: "b",
                                                label: "二値化",
                                                disabled: true,
                                            },
                                            {
                                                value: "c",
                                                label: "高彩度",
                                                disabled: true,
                                            },
                                            {
                                                value: "d",
                                                label: "オリジナル",
                                            },
                                        ]}
                                    />
                                </div>
                                <Checkbox defaultChecked={true}>
                                    ヘッダーを付ける
                                </Checkbox>
                                <div style={{ fontFamily: font }}>
                                    タイトル:&emsp;
                                    <Space.Compact>
                                        <Input
                                            placeholder="サクシード数2B-AB"
                                            size="small"
                                        />
                                    </Space.Compact>
                                </div>
                                <Divider orientation="left">
                                    ファイルの出力
                                </Divider>
                                <Checkbox defaultChecked={true}>
                                    PDFでダウンロード
                                </Checkbox>
                                <br />
                                <Checkbox
                                    defaultChecked={true}
                                    style={{
                                        fontFamily: "Dela Gothic One",
                                    }}
                                >
                                    クラウドへアップロード
                                </Checkbox>
                                <div style={{ fontFamily: font }}>
                                    ファイル名:&emsp;&emsp;
                                    <Input
                                        defaultValue="タイトル"
                                        addonAfter=".pdf"
                                        style={{ width: 200 }}
                                        size="small"
                                    />
                                </div>
                                <Divider orientation="left">
                                    カメラの設定
                                </Divider>
                                <div style={{ fontFamily: font }}>
                                    使用するカメラを選択:&emsp;
                                    <Select
                                        defaultValue="a"
                                        style={{ width: 200 }}
                                        size="small"
                                        options={[
                                            {
                                                value: "a",
                                                label: "カメラ",
                                            },
                                            {
                                                value: "b",
                                                label: "カメラ",
                                            },
                                        ]}
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    適応する画質を選択:&emsp;&emsp;
                                    <Select
                                        defaultValue="a"
                                        style={{ width: 200 }}
                                        size="small"
                                        options={[
                                            {
                                                value: "a",
                                                label: "1920*1080",
                                            },
                                            {
                                                value: "b",
                                                label: "720*1280",
                                            },
                                        ]}
                                    />
                                </div>
                                <Divider orientation="left">
                                    クラウドアカウント
                                </Divider>
                                <Button
                                    icon={<GoogleOutlined />}
                                    iconPosition="start"
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                >
                                    Sign in with Google
                                </Button>
                                <br />
                                <Segmented<string>
                                    options={["Sign up", "Sign in"]}
                                />
                                <br />
                                <Input size="small" style={{ width: 300 }} />
                                <br />
                                <Input.Password
                                    size="small"
                                    style={{ width: 300 }}
                                />
                                <br />
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                >
                                    Sign in
                                </Button>
                            </ConfigProvider>
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </Content>
        </Layout>
    );
};

export default App;
