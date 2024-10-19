import React, { useState, useEffect, SetStateAction } from "react";
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
    Segmented,
    RadioChangeEvent,
} from "antd";
import appIcon from "./appIcon.png";
import {
    GithubOutlined,
    GoogleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import "./index.css";

import {
    streamVideo,
    confirmStreamVideo,
    takeImageConfirmAndEnd,
    getCameraData,
} from "./js/main";

import { signInWithGoogle, genJwtCode } from "./js/auth";
import { CheckboxChangeEvent } from "antd/es/checkbox";

const { Header, Content } = Layout;
const font = "IBM Plex Sans JP";
let config = 1;
let firstGetCameraDataReroadButtonCont = 0;
let nowUseCameraId: string;
let isDownloadPdf = true,
    isUploadCloud = true,
    downloadPdfFileName = "タイトル";

const App: React.FC = () => {
    const [valuePrevVideoWidth, setValuePrevVideoWidth] = useState(920);
    const [valuePrevVideoHeight, setValuePrevVideoHeight] = useState(531);
    // function setTrueSize() {
    //     const onResize = () => {
    //         setValuePrevVideoWidth(
    //             document
    //                 .getElementById("imgPrevVideoDiv")!
    //                 .getBoundingClientRect().width,
    //         );
    //         setValuePrevVideoHeight(
    //             document
    //                 .getElementById("imgPrevVideoDiv")!
    //                 .getBoundingClientRect().height,
    //         );
    //     };
    //     window.addEventListener("resize", onResize);
    //     return () => window.removeEventListener("resize", onResize);
    // }
    // useEffect(() => {
    //     setTrueSize();
    // }, []);
    // setTrueSize();

    const [
        valueChkCfgItemPageNumImgShotRadio,
        setValueChkCfgItemPageNumImgShotRadio,
    ] = useState(1);
    const [isDisabledfirstPageNum, setIsDisabledfirstPageNum] = useState(false);
    const [isDisabledIncreasePageNum, setIsDisabledIncreasePageNum] =
        useState(false);
    const [isDisabledFirstOddPageNum, setIsDisabledFirstOddPageNum] =
        useState(true);
    const [isDisabledLastOddPageNum, setIsDisabledLastOddPageNum] =
        useState(true);
    const chkCfgItemPageNumImgShotRadio = (e: RadioChangeEvent) => {
        setValueChkCfgItemPageNumImgShotRadio(e.target.value);
        switch (e.target.value) {
            case 1:
                setIsDisabledfirstPageNum(false);
                setIsDisabledIncreasePageNum(false);
                setIsDisabledFirstOddPageNum(true);
                setIsDisabledLastOddPageNum(true);
                break;
            case 2:
                setIsDisabledfirstPageNum(true);
                setIsDisabledIncreasePageNum(true);
                setIsDisabledFirstOddPageNum(false);
                setIsDisabledLastOddPageNum(false);
                break;
            case 3:
                setIsDisabledfirstPageNum(true);
                setIsDisabledIncreasePageNum(true);
                setIsDisabledFirstOddPageNum(true);
                setIsDisabledLastOddPageNum(true);
                break;
        }
    };
    const [isDisabledHeaderTitleText, setIsDisabledHeaderTitleText] =
        useState(false);
    const chkCfgItemIsAddHeaderCheck = (e: CheckboxChangeEvent) => {
        if (!e.target.checked) {
            setIsDisabledHeaderTitleText(true);
        } else {
            setIsDisabledHeaderTitleText(false);
        }
    };
    const [isDisabledFileNameText, setIsDisabledFileNameText] = useState(false);
    const [
        isCheckedCfgItemIsOutputToFileCheck,
        setIsCheckedCfgItemIsOutputToFileCheck,
    ] = useState(true);
    const [
        isDisabledCfgItemIsOutputToFileCheck,
        setIsDisabledCfgItemIsOutputToFileCheck,
    ] = useState(false);
    const [
        isCheckedCfgItemIsUploadToCloudCheck,
        setIsCheckedCfgItemIsUploadToCloudCheck,
    ] = useState(true);
    const [
        isDisabledCfgItemIsUploadToCloudCheck,
        setIsDisabledCfgItemIsUploadToCloudCheck,
    ] = useState(false);
    const chkCfgItemIsOutputToFileCheck = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            //checkされたとき
            isDownloadPdf = true;
            setIsDisabledFileNameText(false);
            setIsDisabledCfgItemIsUploadToCloudCheck(false);
            setIsCheckedCfgItemIsOutputToFileCheck(true);
            setIsDisabledCfgItemIsOutputToFileCheck(false);
        } else {
            isDownloadPdf = false;
            setIsDisabledFileNameText(true);
            setIsCheckedCfgItemIsUploadToCloudCheck(true);
            setIsDisabledCfgItemIsUploadToCloudCheck(true);
            setIsCheckedCfgItemIsOutputToFileCheck(false);
            setIsDisabledCfgItemIsOutputToFileCheck(false);
        }
    };
    const changeFileNameText = (e: React.ChangeEvent<HTMLInputElement>) => {
        downloadPdfFileName = e.target.value;
    };
    const chkCfgItemIsUploadToCloudCheck = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            //checkされたとき
            isUploadCloud = true;
            setIsDisabledCfgItemIsOutputToFileCheck(false);
            setIsCheckedCfgItemIsUploadToCloudCheck(true);
            setIsDisabledCfgItemIsUploadToCloudCheck(false);
        } else {
            isUploadCloud = false;
            setIsCheckedCfgItemIsOutputToFileCheck(true);
            setIsDisabledCfgItemIsOutputToFileCheck(true);
            setIsCheckedCfgItemIsUploadToCloudCheck(false);
            setIsDisabledCfgItemIsUploadToCloudCheck(false);
        }
    };

    //カメラの設定
    const [detectedCamerasList, setDetectedCamerasList] = useState([
        {
            value: "null",
            label: "null",
        },
    ]);
    const [
        defalutValueDetectedCamerasList,
        setDefalutValueDetectedCamerasList,
    ] = useState<string>("null"); //よくわからない
    const getCameraDataReroadButton = async () => {
        const returnGetCameraData = await getCameraData();
        if (Array.isArray(returnGetCameraData[0])) {
            //ここもよくわからない
            setDetectedCamerasList(returnGetCameraData[0]);
        }
        nowUseCameraId = returnGetCameraData[1] as string;
        setDefalutValueDetectedCamerasList(nowUseCameraId);
    };
    if (firstGetCameraDataReroadButtonCont < 2) {
        //初回実行後はボタン押下にて実行
        getCameraDataReroadButton();
        firstGetCameraDataReroadButtonCont++;
    }
    const clickDefalutValueDetectedCamerasList = (e: string) => {
        setDefalutValueDetectedCamerasList(e);
        streamVideo(e);
    };

    //email/pw確定ボタン文面を更新
    const [cfgItemEnterSignUpOrInButton, setCfgItemEnterSignUpOrInButton] =
        useState("Sign up"); //初期値は決め打ち
    const chkCfgItemSignUpOrInChoice = (e: string) => {
        setCfgItemEnterSignUpOrInButton(e);
    };

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
                                style={{
                                    padding: "2%",
                                }}
                            >
                                <div
                                    style={{
                                        background: "#ffffff",
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "1em",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    id="imgPrevVideoDiv"
                                >
                                    <video
                                        id="imgPrevVideo"
                                        style={{
                                            width: valuePrevVideoWidth,
                                            height: valuePrevVideoHeight,
                                            borderRadius: "1em",
                                        }}
                                    >
                                        ビデオストリームが利用できません.
                                    </video>
                                    <img id="imgConfirmed"></img>
                                </div>
                            </Splitter.Panel>
                            <Splitter.Panel style={{ padding: "2%" }}>
                                <div
                                    style={{
                                        background: "#ffffff",
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "1em",
                                        padding: "2%",
                                    }}
                                >
                                    <div hidden>
                                        <Button
                                            color="primary"
                                            variant="filled"
                                            size="large"
                                            style={{ width: 597 }}
                                        >
                                            次へ [X]
                                        </Button>
                                        &emsp;&emsp;
                                        <Button
                                            color="danger"
                                            variant="filled"
                                            size="large"
                                            style={{ width: 597 }}
                                        >
                                            前回のフレームを削除 [C]
                                        </Button>
                                    </div>
                                    <div hidden>
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
                                    </div>
                                    <div>
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            size="large"
                                            block
                                            onClick={() =>
                                                streamVideo(nowUseCameraId)
                                            }
                                        >
                                            ストリームを開始 [Enter]
                                        </Button>
                                    </div>
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
                                        onClick={confirmStreamVideo}
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
                                        onClick={() =>
                                            takeImageConfirmAndEnd(
                                                isDownloadPdf,
                                                isUploadCloud,
                                                downloadPdfFileName,
                                            )
                                        }
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
                                background: "#ffffff",
                                height: "100%",
                                width: "100%",
                                borderRadius: "13px",
                                padding: "4%",
                                fontSize: "1em",
                                paddingLeft: "8%",
                                paddingTop: "2%",
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

                                <Radio.Group
                                    onChange={chkCfgItemPageNumImgShotRadio}
                                    value={valueChkCfgItemPageNumImgShotRadio}
                                >
                                    <Radio value={1}>
                                        ページ順そのままに撮影する
                                    </Radio>
                                    <Radio value={2}>
                                        奇数ページ撮影後偶数ページを撮影する
                                    </Radio>
                                    <Radio value={3}>ページを設定しない</Radio>
                                </Radio.Group>

                                <div style={{ fontFamily: font }}>
                                    最初のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                        disabled={isDisabledfirstPageNum}
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
                                        disabled={isDisabledIncreasePageNum}
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    奇数最初のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                        disabled={isDisabledFirstOddPageNum}
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    奇数最後のページ:&emsp;
                                    <InputNumber
                                        addonBefore="Page"
                                        style={{ width: 130 }}
                                        size="small"
                                        disabled={isDisabledLastOddPageNum}
                                    />
                                </div>
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
                                <Checkbox
                                    defaultChecked={true}
                                    onChange={chkCfgItemIsAddHeaderCheck}
                                >
                                    ヘッダーを付ける
                                </Checkbox>
                                <div style={{ fontFamily: font }}>
                                    タイトル:&emsp;
                                    <Space.Compact>
                                        <Input
                                            placeholder="サクシード数2B-AB"
                                            size="small"
                                            disabled={isDisabledHeaderTitleText}
                                        />
                                    </Space.Compact>
                                </div>
                                <Divider orientation="left">
                                    ファイルの出力
                                </Divider>
                                <Checkbox
                                    defaultChecked={true}
                                    onChange={chkCfgItemIsOutputToFileCheck}
                                    checked={
                                        isCheckedCfgItemIsOutputToFileCheck
                                    }
                                    disabled={
                                        isDisabledCfgItemIsOutputToFileCheck
                                    }
                                >
                                    PDFでダウンロード
                                </Checkbox>
                                <br />
                                <Checkbox
                                    defaultChecked={true}
                                    onChange={chkCfgItemIsUploadToCloudCheck}
                                    checked={
                                        isCheckedCfgItemIsUploadToCloudCheck
                                    }
                                    disabled={
                                        isDisabledCfgItemIsUploadToCloudCheck
                                    }
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
                                        onChange={changeFileNameText}
                                        disabled={isDisabledFileNameText}
                                    />
                                </div>
                                <Divider orientation="left">
                                    カメラの設定
                                </Divider>
                                <div style={{ fontFamily: font }}>
                                    使用するカメラを選択
                                    <br />
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={getCameraDataReroadButton}
                                        size="small"
                                    />
                                    &emsp;
                                    <Select
                                        value={defalutValueDetectedCamerasList}
                                        style={{ width: 200 }}
                                        size="small"
                                        options={detectedCamerasList}
                                        onChange={
                                            clickDefalutValueDetectedCamerasList
                                        }
                                    />
                                </div>
                                <div style={{ fontFamily: font }}>
                                    適応する画質を選択
                                    <br />
                                    <Button
                                        icon={<ReloadOutlined />}
                                        size="small"
                                        disabled
                                    />
                                    &emsp;
                                    <Select
                                        defaultValue="a"
                                        style={{ width: 200 }}
                                        size="small"
                                        disabled
                                        options={[
                                            {
                                                value: "a",
                                                label: "1920*1080",
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
                                    onClick={signInWithGoogle}
                                >
                                    Sign in with Google
                                </Button>
                                <br />
                                <br />
                                <div>
                                    <Segmented<string>
                                        options={["Sign up", "Sign in"]}
                                        onChange={chkCfgItemSignUpOrInChoice}
                                    />
                                    <br />
                                    <Input
                                        size="small"
                                        style={{ width: 300 }}
                                    />
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
                                        onClick={genJwtCode}
                                    >
                                        {cfgItemEnterSignUpOrInButton}
                                    </Button>
                                </div>
                                <div hidden>
                                    登録のアドレスに認証メールを送信しました.
                                    <br />
                                    メールを確認してURLにアクセスしてください.
                                    <br />
                                    <Button color="primary" variant="outlined">
                                        URLにアクセスして認証を済ませた
                                    </Button>
                                </div>
                                <div hidden>
                                    ログイン済
                                    <br />
                                    ozawakoudai@gmail.com
                                    <br />
                                    <Button
                                        color="danger"
                                        variant="outlined"
                                        size="small"
                                    >
                                        {" "}
                                        ログアウト
                                    </Button>
                                </div>
                            </ConfigProvider>
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </Content>
        </Layout>
    );
};

export { config };
export default App;
